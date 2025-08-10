import { defineOption } from "cmdore"


export default defineOption({
    name: "defaults",
    alias: "d",
    description: "set track as default in the merged file (use 'yes' to enable)",
    resumable: true,
    defaultValue: () => {
        return [ true ]
    },
    parse: (...defaults) => {
        return defaults.map(defaultValue => defaultValue === "yes")
    }
})
