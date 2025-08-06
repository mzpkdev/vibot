import * as path from "node:path"
import { defineCommand, terminal } from "cmdore"
import { success } from "@/messages"
import { zip } from "@/utilities/array"
import mkvmerge, { clean, file, track } from "@/executables/mkvmerge"
import { audio, defaults, input, language, number, output, purge, subtitles, title } from "@/options"


export default defineCommand({
    name: "merge",
    description: "merge video, audio, and subtitle files into a single MKV container",
    examples: [
        `-o example/merged -i example/videos -a example/audio/en example/audio/jp`,
        `-o example/merged -i example/videos -s example/subtitles/en -p`,
        `-o example/merged -i example/videos -a example/audio/jp -s example/subtitles/en -t "Audio|Subtitles"`
    ],
    options: [
        input,
        output,
        audio,
        subtitles,
        language,
        title,
        defaults,
        number,
        purge
    ],
    run: async function* ({ ...options }) {
        const { title, language, defaults, number, purge } = options
        for (const [ input, audio, subtitles ] of zip(options.input, zip(...options.audio), zip(...options.subtitles))) {
            const output = path.join(options.output, path.basename(input))
            const results = await runner(input, output, audio, subtitles, language, title, defaults, number, purge)
            if (results.output != null) {
                terminal.print(success(results.output))
            }
            yield results
        }
    }
})

export const runner = async (
    input: string,
    output: string,
    audio: string[] = [],
    subtitles: string[] = [],
    language: string[] = [],
    title: string[][] = [],
    defaults: boolean[] = [],
    number: number[] = [],
    purge: boolean = false
) => {
    await mkvmerge(output,
        purge
            ? clean([ `subtitles`, `audio` ])
            : null,
        file(input),
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
