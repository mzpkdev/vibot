import { defineOption } from "cmdore"


export default defineOption({
    name: "language",
    alias: "l",
    description: "specify ISO language code for audio and subtitle tracks (e.g., 'en', 'jp')",
    resumable: true,
    defaultValue: () => {
        return [ "und" ]
    },
    parse: (...languages) => {
        return languages
    }
})
