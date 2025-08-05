import * as fs from "node:fs"
import * as path from "node:path"
import { defineOption } from "cmdore"


export default defineOption({
    name: "subtitles",
    alias: "s",
    description: "",
    defaultValue: () => {
        return []
    },
    validate: (...pathnames) => {
        for (const pathname of pathnames) {
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
