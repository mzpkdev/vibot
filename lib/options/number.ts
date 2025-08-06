import { defineOption } from "cmdore"


export default defineOption({
    name: "number",
    alias: "n",
    description: "specify track number to extract or use in merge operations",
    defaultValue: () => {
        return [ 0 ]
    },
    validate: (...numbers) => {
        for (const number of numbers) {
            if (Number.isNaN(Number(number))) {
                throw new Error(`Number "${number}" is not a number.`)
            }
        }
    },
    parse: (...numbers) => {
        return numbers.map(Number)
    }
})
