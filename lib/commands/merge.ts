import * as path from "node:path"
import { defineCommand, terminal } from "cmdore"
import mkvmerge, { clean, file, track } from "@/executables/mkvmerge"
import { audio, defaults, input, language, number, output, purge, resume, subtitles, title } from "@/options"
import { zip } from "@/utilities/array"
import { success } from "@/messages"
import { resumable, retriable } from "@/tools"


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
        purge,
        resume
    ],
    run: resumable(async function* (argv, resume) {
        const { title, language, defaults, number, purge } = argv
        const tuples = zip(argv.input, zip(...argv.audio), zip(...argv.subtitles))
        for (const [ input, audio, subtitles ] of tuples) {
            const output = path.join(argv.output, path.basename(input))
            const results = await resume([ input, audio, subtitles ], () =>
                retriable(runner)(input, output, audio, subtitles, language, title, defaults, number, purge)
            )
            if (results.output != null) {
                terminal.print(success(results.output))
            }
            yield results
        }
    })
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
