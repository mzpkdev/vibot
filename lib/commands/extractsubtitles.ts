import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import { TrackType } from "@/core/executables"
import ffmpeg, { extract } from "@/executables/ffmpeg"
import { input, number, output } from "@/options"


export default defineCommand({
    name: "extractsubtitles",
    description: "extractsubtitles",
    options: [
        input,
        output,
        number
    ],
    run: async function* ({ ...options }) {
        const { number } = options
        effect(() => {
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true })
            }
        })
        for (const input of options.input) {
            const output = `${path.join(options.output, path.basename(input, path.extname(input)))}.srt`
            const results = await extractsubtitles(input, output, number)
            if (results.output != null) {
                terminal.print(success(results.output))
            }
            yield results
        }
    }
})

export const extractsubtitles = async (
    input: string,
    output: string,
    number: number[]
) => {
    await ffmpeg(input, effect.enabled ? output : null, extract(number[0], TrackType.SUBTITLES))
    return { output }
}
