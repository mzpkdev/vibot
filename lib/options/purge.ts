import { defineOption } from "cmdore"


export default defineOption({
    name: "purge",
    alias: "p",
    description: "remove subtitle and audio tracks from the input file before merging",
    resumable: true,
    parse: () => {
        return true
    }
})
