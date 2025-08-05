import { defineOption } from "cmdore"


export default defineOption({
    name: "title",
    alias: "t",
    description: "",
    defaultValue: () => {
        return [ [ "" ] ]
    },
    parse: (...titles) => {
        return titles.map(title => title.split("|"))
    }
})
