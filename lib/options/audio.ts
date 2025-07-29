import * as fs from "node:fs"
import * as path from "node:path"
import { defineOption } from "cmdore"


export default defineOption({
    name: "audio",
    alias: "a",
    description: "",
    defaultValue: () => {
        return []
    },
    validate: (...values) => {
        for (const pathname of values) {
            if (!fs.existsSync(pathname)) {
                throw new Error(`Path ${pathname} does not exist`)
            }
        }
    },
    parse: (...pathnames) => {
        return pathnames.map((pathname) => {
            return fs.readdirSync(pathname)
                .map(filename => path.join(pathname, filename))
        })
    }
})
