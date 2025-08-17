import * as fs from "node:fs"
import * as path from "node:path"
import { defineOption } from "cmdore"


export default defineOption({
    name: "audio",
    alias: "a",
    description: "path to directory containing audio files to be included in the merge",
    resumable: true,
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
            const stats = fs.statSync(pathname)
            if (stats.isFile()) {
                return [ pathname ]
            }
            return fs.readdirSync(pathname)
                .filter(filename => !filename.startsWith("."))
                .map(filename => path.join(pathname, filename))
        })
    }
})
