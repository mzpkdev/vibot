import * as fs from "node:fs"
import * as path from "node:path"
import { defineOption } from "cmdore"


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
    parse: (pathname) => {
        return fs.readdirSync(pathname)
            .map(filename => path.join(pathname, filename))
    }
})
