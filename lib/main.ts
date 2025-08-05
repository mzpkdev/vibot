import { Program, terminal } from "cmdore"
import rename from "@/commands/rename"
import merge from "@/commands/merge"
import extractaudio from "@/commands/extractaudio"


export async function main(...varargs: string[]): Promise<number> {
    const program = new Program()
    await program
        .register(rename)
        .register(merge)
        .register(extractaudio)
        .execute(varargs)
    return 0
}


main(...process.argv.slice(2))
    .catch(error => terminal.error(error))
