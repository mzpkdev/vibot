import * as path from "node:path"
import { defineCommand, effect, terminal } from "cmdore"
import { success } from "@/messages"
import { TrackType } from "@/core/executables"
import ffprobe, { info } from "@/executables/ffprobe"
import ffmpeg, { extract } from "@/executables/ffmpeg"
import { input, number, output } from "@/options"
import * as fs from "node:fs"


export default defineCommand({
    name: "extractaudio",
    description: "extractaudio",
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
            const output = path.join(options.output, path.basename(input, path.extname(input)))
            const results = await extractaudio(input, output, number)
            if (results.output != null) {
                terminal.print(success(results.output))
            }
            yield results
        }
    }
})

export const extractaudio = async (
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
