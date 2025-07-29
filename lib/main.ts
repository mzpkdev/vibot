import { Program, terminal } from "cmdore"
import rename from "@/commands/rename"
import merge from "@/commands/merge"


export async function main(...varargs: string[]): Promise<number> {
    const program = new Program()
    await program
        .register(rename)
        .register(merge)
        .execute(varargs)
    return 0
}


main(...process.argv.slice(2))
    .catch(error => terminal.error(error))
