import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect } from "cmdore"
import { success } from "@/messages"
import { TrackType } from "@/core/executables"
import { resumable, retriable } from "@/tools"
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
    run: resumable(async function* (options, resume) {
        const { output, number } = options
        await effect(() => {
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true })
            }
        })
        for (const input of options.input) {
            const results = await resume([ input ], () =>
                retriable(runner)(input, output, number))
            if (results.output != null) {
                console.log(success(results.output, results.date))
            }
            yield results
        }
    })
})

export const runner = async (
    input: string,
    output: string,
    number: number[],
) => {
    const streams = await ffprobe(input, info(TrackType.AUDIO))
    await Promise.all(
        streams
            .filter((_, index) => number.length == 0 || number.includes(index))
            .map(async (stream, index) => {
                const codec = stream.codec
                const dirname = path.join(output, String(index))
                await effect(() => {
                    if (!fs.existsSync(dirname)) {
                        fs.mkdirSync(dirname)
                    }
                })
                const filename = `${path.basename(input, path.extname(input))}.${index}.${codec}`
                await ffmpeg(input, effect.enabled ? path.join(dirname, filename) : null, extract(index, TrackType.AUDIO))
            })
    )
    return { output: input, date: new Date().toISOString() }
}
