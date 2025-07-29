import { defineOption } from "cmdore"


export default defineOption({
    name: "number",
    alias: "n",
    description: "",
    defaultValue: () => {
        return [ 0 ]
    },
    validate: (...values) => {
        for (const value of values) {
            if (Number.isNaN(Number(value))) {
                throw new Error(`Number "${value}" is not a number.`)
            }
        }
    },
    parse: (...values) => {
        return values.map(Number)
    }
})
