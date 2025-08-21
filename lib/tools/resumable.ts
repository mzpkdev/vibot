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
    #filename: string

    constructor(directory: string) {
        this.#filename = path.join(directory, "savestate.txt")
    }

    exists(): boolean {
        return fs.existsSync(this.#filename)
    }

    create(command: Command): void {
        fs.mkdirSync(path.dirname(this.#filename), { recursive: true })
        fs.writeFileSync(this.#filename, JSON.stringify(command) + "\n\n")
    }

    read(): Save {
        const file = (fs.readFileSync(this.#filename, "utf8") as string)
            .split("\n")
            .filter(line => line != "")
        const [ command, ...products ] = file
        return {
            command: JSON.parse(command),
            products: products.map(product => JSON.parse(product))
        }
    }

    write(product: Product): void {
        fs.appendFileSync(this.#filename, JSON.stringify(product) + "\n")
    }
}

const resumable = <TThis, TArgv, TReturnValue>(
    fn: (this: TThis, argv: TArgv, resume: ResumeFunction) => AsyncIterable<TReturnValue>
)=> {
    return async function* (this: TThis, argv: TArgv) {
        const thisRecord = this as Record<string, any>
        const argvRecord = argv as Record<string, any>

        const cachedir = path.join(argvRecord.output, `.${require("../../package.json").name}`)
        const savefile = new Savefile(cachedir)
        const command: Command = {
            name: thisRecord.name,
            argv: Object.fromEntries(
                (thisRecord.options ?? [])
                    .filter((definition: any) => definition.resumable)
                    .map((definition: any) => [ definition.name, argvRecord[definition.name] ])
            )
        }
        if (!savefile.exists()) {
            savefile.create(command)
        }
        let save = savefile.read()

        if (JSON.stringify(command) != JSON.stringify(save.command)) {
            const toReuseLastCommand = await terminal.prompt(
                `Do you want to reuse your last command?`,
                answer => /^(y|yes)$/i.test(answer)
            )
            if (toReuseLastCommand) {
                Object.assign(argvRecord, save.command.argv)
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
            console.debug(`Skipping...`)
            return product.output as any
        }

        yield* fn.call(this, argv, resume)
        fs.rmSync(cachedir, { force: true, recursive: true })
    }
}

export default resumable
