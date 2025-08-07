import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import { AudioCodec, TrackType } from "@/core/executables"
import { resumable, retry } from "@/core/commands"
import ffprobe, { info } from "@/executables/ffprobe"
import ffmpeg, { ac, ar, bitrate, codec, copy, filter, loudnorm, map } from "@/executables/ffmpeg"
import { exclude, input, output, resume } from "@/options"


export default defineCommand({
    name: "loudnorm",
    description: "normalize audio loudness in video files to improve listening experience",
    examples: [
        "-o example/normalized -i example/video -x 1"
    ],
    options: [
        input,
        output,
        exclude,
        resume
    ],
    run: async function* (options) {
        yield* resumable(options.output, async function* (skip) {
            const { exclude } = options
            await effect(() => {
                if (!fs.existsSync(options.output)) {
                    fs.mkdirSync(options.output, { recursive: true })
                }
            })
            for (const input of options.input) {
                const output = path.join(options.output, path.basename(input))
                const results = await skip(() => {
                    return retry(() => runner(input, output, exclude))
                }, `${input}:${output}:${exclude}`)
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
    exclude: number[]
) => {
    const blacklisted = [ AudioCodec.TRUEHD, AudioCodec.DTS_HD, AudioCodec.DTS ]
    const streams = await ffprobe(input, info(TrackType.AUDIO))
    await ffmpeg(
        input,
        `"${output}"`,
        ar(48000),
        map(null, TrackType.VIDEO),
        copy(null, TrackType.VIDEO),
        map(null, TrackType.SUBTITLES),
        copy(null, TrackType.SUBTITLES),
        ...streams
            .map((stream, index) => ({ stream, index }))
            .filter(({ index }) => !exclude.includes(index))
            .filter(({ stream }) => !blacklisted.includes(stream.codec))
            .flatMap(({ stream, index }) => [
                map(index, TrackType.AUDIO),
                filter(index, loudnorm()),
                ac(stream.channels),
                codec(index, TrackType.AUDIO, codec.audio(stream.codec, stream.channels)),
                bitrate(index, TrackType.AUDIO, bitrate.audio(stream.codec, stream.channels))
            ])
    )
    return { output }
}
