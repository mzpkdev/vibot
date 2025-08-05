import * as path from "node:path"
import { defineCommand, terminal } from "cmdore"
import { success } from "@/messages"
import { zip } from "@/utilities/array"
import mkvmerge, { clean, track } from "@/executables/mkvmerge"
import { audio, defaults, input, language, number, output, subtitles, title } from "@/options"


export default defineCommand({
    name: "merge",
    description: "merge files to mkv",
    examples: [
        `--output example/merged --input example/videos --audio example/audio/en example/audio/jp`,
        `--output example/merged --input example/videos --subtitles example/subtitles/en`,
        `-o example/merged -i example/videos -a example/audio/jp -s example/subtitles/en --title "Audio|Subtitles"`
    ],
    options: [
        input,
        output,
        audio,
        subtitles,
        language,
        title,
        defaults,
        number
    ],
    run: async function* ({ ...options }) {
        const { title, language, defaults, number } = options
        for (const [ input, audio, subtitles ] of zip(options.input, zip(...options.audio), zip(...options.subtitles))) {
            const output = path.join(options.output, path.basename(input))
            const results = await merge(input, output, audio, subtitles, language, title, defaults, number)
            if (results.output != null) {
                terminal.print(success(results.output))
            }
            yield results
        }
    }
})

export const merge = async (
    input: string,
    output: string,
    audio: string[] = [],
    subtitles: string[] = [],
    language: string[] = [],
    title: string[][] = [],
    defaults: boolean[] = [],
    number: number[] = []
) => {
    await mkvmerge(output,
        clean(input, [ `subtitles`, `audio` ]),
        ...audio.map((audio, index) =>
            track(audio, {
                index: number[index],
                title: title[index][0],
                language: language[index],
                defaults: defaults[index]
            })
        ),
        ...subtitles.map((subtitle, index) =>
            track(subtitle, {
                index: number[index],
                title: title[index][1] ?? title[index][0],
                language: language[index],
                defaults: defaults[index]
            })
        )
    )
    return { output }
}
