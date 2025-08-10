import { defineOption } from "cmdore"


export default defineOption({
    name: "exclude",
    alias: "x",
    description: "specify track numbers to exclude from processing operations",
    resumable: true,
    defaultValue: () => {
        return []
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
