import * as fs from "node:fs"
import { defineOption } from "cmdore"
import { scan } from "@/utilities/fs"


export default defineOption({
    name: "input",
    alias: "i",
    description: "path to directory containing input files to be processed",
    resumable: true,
    validate: (pathname) => {
        if (!fs.existsSync(pathname)) {
            throw new Error(`Path ${pathname} does not exist`)
        }
    },
    parse: (pathname) =>
        scan(pathname)
})
