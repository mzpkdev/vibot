import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { input, output } from "@/options"
import { success } from "@/messages"


export default defineCommand({
    name: "rename",
    description: "rename files to specified format",
    options: [
        input,
        output
    ],
    run: async function* ({ input, output }) {
        for (const filename of input) {
            const results = await rename(filename, output)
            terminal.print(success(results.output))
            yield results
        }
    }
})

export const rename = async (input: string, output: string) => {
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
    effect(() => fs.mkdirSync(path.dirname(filename), { recursive: true }))
    terminal.verbose(`Copying "${input}" to "${filename}"...`)
    effect(() => fs.copyFileSync(input, filename))
    return { output: filename }
}
