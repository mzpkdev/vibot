import { defineOption } from "cmdore"


export default defineOption({
    name: "defaults",
    alias: "d",
    description: "",
    defaultValue: () => {
        return [ true ]
    },
    parse: (...defaults) => {
        return defaults.map(defaultValue => defaultValue === "yes")
    }
})
