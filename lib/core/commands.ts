import * as fs from "node:fs"
import * as path from "node:path"
import { terminal } from "cmdore"


export type Skip = <TReturnValue>(executor: () => Promise<TReturnValue>, key: string) => Promise<TReturnValue>

export const resumable = async function* (directory: string, inner: (skip: Skip) => AsyncGenerator<any, void, unknown>, enabled: boolean = true): any {
    const cache = path.join(directory, `.${require("../../package.json").name}`)
    const statefile = path.join(cache, "statefile.txt")
    fs.mkdirSync(cache, { recursive: true })
    if (!fs.existsSync(statefile)) {
        fs.writeFileSync(statefile, "")
    }
    const separator = " --- "
    const finished = fs.readFileSync(statefile, "utf8").split("\n")
    const skip: Skip = async (executor: () => Promise<unknown>, key: string) => {
        const [ savedKey, savedOutput ] = finished.shift()?.split(separator) ?? []
        if (!enabled || savedKey !== key) {
            if (!(savedKey == null || savedKey.length == 0)) {
                const toStartOver = await terminal.prompt(
                    `Cannot resume process. Do you want to start over?`,
                    answer => /^(y|yes)$/i.test(answer)
                )
                if (toStartOver) {
                    fs.writeFileSync(statefile, "")
                    finished.splice(0)
                } else {
                    process.exit(1)
                }
            }
            const returnValue = await executor()
            fs.appendFileSync(statefile, `${key}${separator}${JSON.stringify(returnValue)}\n`)
            return returnValue
        }
        return JSON.parse(savedOutput)
    }
    yield* inner(skip)
    fs.rmSync(cache, { recursive: true, force: true })
}

export const retry = <TReturnValue>(callback: () => TReturnValue, retries: number = 5): TReturnValue => {
    if (retries < 0) {
        return callback()
    }
    try {
        return callback()
    } catch {
        return retry(callback, retries - 1)
    }
}
