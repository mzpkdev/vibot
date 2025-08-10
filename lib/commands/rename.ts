import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import resumable from "@/core/tools/resumable"
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
    run: resumable(async function* (options, resume) {
        for (const filename of options.input) {
            const results = await resume([ filename ], () => runner(filename, options.output))
            terminal.print(success(results.output))
            yield results
        }
    })
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
