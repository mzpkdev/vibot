import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect } from "cmdore"
import { success } from "@/messages"
import { TrackType } from "@/core/executables"
import { resumable, retriable } from "@/tools"
import ffmpeg, { extract } from "@/executables/ffmpeg"
import { input, number, output, resume } from "@/options"


export default defineCommand({
    name: "extractsubtitles",
    description: "extract subtitle tracks from video files and save them as SRT files",
    examples: [
        "-o example/subtitles/en -i example/video -n 0"
    ],
    options: [
        input,
        output,
        number,
        resume
    ],
    run: resumable(async function* (options, resume) {
        const { number } = options
        await effect(() => {
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true })
            }
        })
        for (const input of options.input) {
            const output = `${path.join(options.output, path.basename(input, path.extname(input)))}.srt`
            const results = await resume([ input ], () => retriable(runner)(input, output, number))
            if (results.output != null) {
                console.log(success(results.output))
            }
            yield results
        }
    })
})

export const runner = async (
    input: string,
    output: string,
    number: number[]
) => {
    await ffmpeg(input, effect.enabled ? output : null, extract(number[0], TrackType.SUBTITLES))
    return { output }
}
