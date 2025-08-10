import * as fs from "node:fs"
import * as path from "node:path"
import trash from "trash"
import cmdore, { effect, terminal } from "cmdore"
import rename from "@/commands/rename"
import merge from "@/commands/merge"
import extractaudio from "@/commands/extractaudio"
import extractsubtitles from "@/commands/extractsubtitles"
import loudnorm from "@/commands/loudnorm"
import encode from "@/commands/encode"
import { output, resume } from "@/options"


export async function main(...varargs: string[]): Promise<number> {
    const program = cmdore()
        .intercept([ output, resume ], async ({ output, resume }: any) => {
            if (!fs.existsSync(output)) {
                fs.mkdirSync(output, { recursive: true })
            }
            const files = fs.readdirSync(output)
                .map(file => path.join(output, file))
            if (!resume && files.length > 0) {
                const toTrash = await terminal.prompt(
                    `Directory "${output}" cannot contain files. Do you want to delete them?`,
                    answer => /^(y|yes)$/i.test(answer)
                )
                if (toTrash) {
                    terminal.verbose(`Moving ${files.length} files from "${output}" directory to trash.`)
                    await effect(async () => {
                        try {
                            await trash(files)
                        } catch {
                            const toPermanentlyDelete = await terminal.prompt(
                                `Cannot move "${output}" files to trash. Do you want to try permanently deleting them?`,
                                answer => /^(y|yes)$/i.test(answer)
                            )
                            if (toPermanentlyDelete) {
                                for (const file of files) {
                                    fs.rmSync(file, { recursive: true, force: true })
                                }
                            }
                        }
                    })
                }
            }
        })
    await program
        .register(rename as any)
        .register(merge as any)
        .register(extractaudio as any)
        .register(extractsubtitles as any)
        .register(loudnorm as any)
        .register(encode as any)
        .execute(varargs)
    return 0
}


main(...process.argv.slice(2))
    .catch(error => terminal.error(error))
