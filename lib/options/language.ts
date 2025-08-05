import { defineOption } from "cmdore"


export default defineOption({
    name: "language",
    alias: "l",
    description: "",
    defaultValue: () => {
        return [ "und" ]
    },
    parse: (...languages) => {
        return languages
    }
})
