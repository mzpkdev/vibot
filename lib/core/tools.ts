import * as fs from "node:fs"
import * as path from "node:path"
import { terminal } from "cmdore"


export type Skip = <TReturnValue, TDependencies extends readonly unknown[]>(
    executor: (...args: TDependencies) => Promise<TReturnValue>,
    dependencies: TDependencies
) => Promise<TReturnValue>


export const resumable = async function* (directory: string, inner: (skip: Skip) => AsyncGenerator<any, void, unknown>, enabled: boolean = true): any {
    const cache = path.join(directory, `.${require("../../package.json").name}`)
    const savestate = path.join(cache, "savestate.db")
    fs.mkdirSync(cache, { recursive: true })
    if (!fs.existsSync(savestate)) {
        fs.writeFileSync(savestate, "")
    }
    const separator = " --- "
    const finished = fs.readFileSync(savestate, "utf8").split("\n")
    const skip: Skip = async (executor, key) => {
        const [ savedKey, savedOutput ] = finished.shift()?.split(separator) ?? []
        const serializedKey = key.join(":")
        if (!enabled || savedKey !== serializedKey) {
            if (!(savedKey == null || savedKey.length == 0)) {
                const toStartOver = await terminal.prompt(
                    `Cannot resume process. Do you want to start over?`,
                    answer => /^(y|yes)$/i.test(answer)
                )
                if (toStartOver) {
                    fs.writeFileSync(savestate, "")
                    finished.splice(0)
                } else {
                    process.exit(1)
                }
            }
            const returnValue = await executor(...key)
            fs.appendFileSync(savestate, `${serializedKey}${separator}${JSON.stringify(returnValue)}\n`)
            return returnValue
        } else {
            terminal.verbose(`Skipping...`)
        }
        return JSON.parse(savedOutput)
    }
    yield* inner(skip)
    fs.rmSync(cache, { recursive: true, force: true })
}

export const retry = <TReturnValue, TArgs extends readonly unknown[]>(
    callback: (...varargs: TArgs) => Promise<TReturnValue>,
    retries: number = 5
) => {
    return async function r(...varargs: TArgs): Promise<TReturnValue> {
        if (retries < 0) {
            return callback(...varargs)
        }
        try {
            return await callback(...varargs)
        } catch {
            terminal.verbose(`Retrying...`)
            return retry(callback, retries - 1)(...varargs)
        }
    }
}
