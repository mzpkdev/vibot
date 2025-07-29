import { defineOption } from "cmdore"
import * as fs from "node:fs"
import * as path from "node:path"


export default defineOption({
    name: "output",
    alias: "o",
    required: true,
    description: "path to output directory",
    validate: (pathname) => {
        if (!fs.existsSync(pathname)) {
            return true
        }
        if (fs.readdirSync(pathname).length > 0) {
            throw new Error(`Directory ${pathname} not empty.`)
        }
    },
    parse: (pathname) => {
        return path.normalize(pathname)
    }
})
