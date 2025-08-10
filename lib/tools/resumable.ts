import * as crypto from "crypto"
import * as path from "node:path"
import * as fs from "node:fs"
import { terminal } from "cmdore"


type Command = {
    name: string
    argv: Record<string, unknown>
}

type Product = {
    input: string
    output: unknown
}

export type Save = {
    command: Command
    products: Product[]
}

export type ResumeFunction = <TReturnValue>(key: unknown[], fn: () => TReturnValue) => Promise<TReturnValue> | TReturnValue

const hash = (object: object): string => {
    const stringified = JSON.stringify(object, Object.keys(object).sort())
    return crypto.createHash("sha1")
        .update(stringified)
        .digest("base64")
        .replace(/[+/=]/g, "")
}

class Savefile {
    #_filename: string

    constructor(directory: string) {
        const cachedir = path.join(directory, `.${require("../../package.json").name}`)
        this.#_filename = path.join(cachedir, "savestate.txt")
    }

    exists(): boolean {
        return fs.existsSync(this.#_filename)
    }

    create(command: Command): void {
        fs.mkdirSync(path.dirname(this.#_filename), { recursive: true })
        fs.writeFileSync(this.#_filename, JSON.stringify(command) + "\n\n")
    }

    read(): Save {
        const file = (fs.readFileSync(this.#_filename, "utf8") as string)
            .split("\n")
            .filter(line => line != "")
        const [ command, ...products ] = file
        return {
            command: JSON.parse(command),
            products: products.map(product => JSON.parse(product))
        }
    }

    write(product: Product): void {
        fs.appendFileSync(this.#_filename, JSON.stringify(product) + "\n")
    }

    clear(): void {
        fs.writeFileSync(this.#_filename, "")
    }

    delete(): void {
        fs.rmdirSync(this.#_filename)
    }
}

const resumable = <TThis, TArgv, TReturnValue>(
    fn: (this: TThis, argv: TArgv, resume: ResumeFunction) => TReturnValue
): (this: TThis, argv: TArgv) => any => {
    return async function (this: TThis, argv: TArgv) {
        // TODO: Remove __this and __argv
        const __this = this as Record<string, any>,
            __argv = argv as Record<string, any>
        // -- || --

        const savefile = new Savefile(__argv.output)
        const command: Command = {
            name: __this.name,
            argv: Object.fromEntries(
                (__this.options ?? [])
                    .filter((definition: any) => definition.resumable)
                    .map((definition: any) => [ definition.name, __argv[definition.name] ])
            )
        }
        if (!savefile.exists()) {
            savefile.create(command)
        }
        let save = savefile.read()

        if (JSON.stringify(command) != JSON.stringify(save.command)) {
            Object.assign(__argv, save.command.argv)
        }

        if (JSON.stringify(command) != JSON.stringify(save.command)) {
            const toReuseLastCommand = await terminal.prompt(
                `Do you want to reuse your last command?`,
                answer => /^(y|yes)$/i.test(answer)
            )
            if (toReuseLastCommand) {
                Object.assign(__argv, save.command.argv)
            } else {
                const toStartOver = await terminal.prompt(
                    `Cannot resume process, received different arguments. Do you want to start over?`,
                    answer => /^(y|yes)$/i.test(answer)
                )
                if (toStartOver) {
                    savefile.create(command)
                    save = savefile.read()
                } else {
                    process.exit(1)
                }
            }
        }

        const resume: ResumeFunction = async (key, fn) => {
            const product = save.products.shift()
            if (product == null) {
                const returnValue = await fn()
                savefile.write({ input: hash(key), output: returnValue })
                return returnValue
            }
            terminal.verbose(`Skipping...`)
            return product.output as any
        }

        const returnValue = fn.call(this, argv, resume)
        savefile.delete()
        return returnValue
    }
}

export default resumable