import { defineOption } from "cmdore"


export default defineOption({
    name: "resume",
    alias: "r",
    description: "continue processing from where it was previously interrupted, skipping already processed files",
    defaultValue: () => {
        return false
    },
    parse: () => {
        return true
    }
})
