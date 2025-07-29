import { defineOption } from "cmdore"


export default defineOption({
    name: "defaults",
    alias: "d",
    description: "",
    defaultValue: () => {
        return [ true ]
    },
    parse: (...values) => {
        return values.map(value => value === "yes")
    }
})
