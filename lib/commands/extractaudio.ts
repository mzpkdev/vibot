import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import { TrackType } from "@/core/executables"
import { resumable } from "@/core/commands"
import ffprobe, { info } from "@/executables/ffprobe"
import ffmpeg, { extract } from "@/executables/ffmpeg"
import { input, number, output, resume } from "@/options"


export default defineCommand({
    name: "extractaudio",
    description: "extract audio tracks from video files and save them as separate files",
    examples: [
      "-o example/audio/jp -i example/video -n 0"
    ],
    options: [
        input,
        output,
        number,
        resume
    ],
    run: async function* ({ ...options }) {
        yield* resumable(options.output, async function* (skip) {
            const { number } = options
            await effect(() => {
                if (!fs.existsSync(options.output)) {
                    fs.mkdirSync(options.output, { recursive: true })
                }
            })
            for (const input of options.input) {
                const output = path.join(options.output, path.basename(input, path.extname(input)))
                const results = await skip(() => {
                    return runner(input, output, number)
                }, `${input}:${output}:${number}`)
                if (results.output != null) {
                    terminal.print(success(results.output))
                }
                yield results
            }
        }, options.resume)
    }
})

export const runner = async (
    input: string,
    output: string,
    number: number[]
) => {
    const streams = await ffprobe(input, info(TrackType.AUDIO))
    const [ index ] = number
    const codec = streams[index]?.codec
    const filename = `${output}.${codec}`
    await ffmpeg(input, effect.enabled ? filename : null, extract(index, TrackType.AUDIO))
    return { output: filename }
}
