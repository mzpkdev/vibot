import * as fs from "node:fs"
import * as path from "node:path"
import { defineCommand, effect } from "cmdore"
import { success } from "@/messages"
import { resumable, retriable } from "@/tools"
import { TrackType, VideoCodec } from "@/core/executables"
import ffmpeg, { codec, copy, encode, Encoder, ENCODER_PRESETS, EncoderPreset, map } from "@/executables/ffmpeg"
import { config, input, output, resume } from "@/options"


export default defineCommand({
    name: "encode",
    description: "encode video files with configurable quality and compression settings",
    examples: [
        "-i example/video -o example/encoded",
        "-i example/video -o example/encoded -c encoder:H265",
        "-i example/video -o example/encoded -c preset:ANIMATION crf:18"
    ],
    options: [
        input,
        output,
        config,
        resume
    ],
    run: resumable(async function* (options, resume) {
        const { config } = options
        await effect(() => {
            if (!fs.existsSync(options.output)) {
                fs.mkdirSync(options.output, { recursive: true })
            }
        })
        for (const input of options.input) {
            const output = path.join(options.output, path.basename(input))
            const results = await resume([ input ], () => retriable(runner)(input, output, config))
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
    config: Record<string, any> = {}
) => {
    const { encoder = "H264", preset = "STANDARD", crf = 21 } = config
    const encoding = ENCODER_PRESETS[encoder as Encoder][preset as EncoderPreset]
    await ffmpeg(
        input,
        output,
        codec(null, TrackType.VIDEO, VideoCodec[encoder as Encoder]),
        encode(encoding, crf),
        copy(null, TrackType.AUDIO),
        copy(null, TrackType.SUBTITLES),
        map(null)
    )
    return { output }
}
