import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect } from "cmdore"
import { success } from "@/messages"
import { resumable, retriable } from "@/tools"
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
            const results = await resume([ filename ], () => retriable(runner)(filename, options.output))
            console.log(success(results.output, results.date))
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
    console.debug(`Creating directory "${path.dirname(filename)}"...`)
    await effect(async () => fs.mkdirSync(path.dirname(filename), { recursive: true }))
    console.debug(`Copying "${input}" to "${filename}"...`)
    await effect(async () => fs.copyFileSync(input, filename))
    return { output: filename, date: new Date() }
}
