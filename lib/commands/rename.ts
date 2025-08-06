import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import { resumable } from "@/core/commands"
import { input, output, resume } from "@/options"


export default defineCommand({
    name: "rename",
    description: "rename files according to a specified format pattern",
    examples: [
        "-o example/renamed/{name}.1080p.mkv -i example/video"
    ],
    options: [
        input,
        output,
        resume
    ],
    run: async function* (options) {
        yield* resumable(path.dirname(options.output), async function* (skip) {
            for (const filename of options.input) {
                const results = await skip(() => {
                    return runner(filename, options.output)
                }, `${filename}:${options.output}`)
                terminal.print(success(results.output))
                yield results
            }
        }, options.resume)
    }
})

export const runner = async (input: string, output: string) => {
    const format = (template: string, values: path.ParsedPath): string => {
        return template.replace(/{(.*?)}/g, (_, key: keyof path.ParsedPath) => {
            if (values[key]) {
                return values[key]
            } else {
                throw new Error("Invalid template.")
            }
        })
    }
    const filename = format(output, path.parse(input))
    terminal.verbose(`Creating directory "${path.dirname(filename)}"...`)
    await effect(async () => fs.mkdirSync(path.dirname(filename), { recursive: true }))
    terminal.verbose(`Copying "${input}" to "${filename}"...`)
    await effect(async () => fs.copyFileSync(input, filename))
    return { output: filename }
}
