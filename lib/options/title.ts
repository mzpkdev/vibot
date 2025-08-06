import { defineOption } from "cmdore"


export default defineOption({
    name: "title",
    alias: "t",
    description: "specify title for tracks in the merged file (use '|' to separate audio and subtitle titles)",
    defaultValue: () => {
        return [ [ "" ] ]
    },
    parse: (...titles) => {
        return titles.map(title => title.split("|"))
    }
})
