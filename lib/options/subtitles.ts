import * as fs from "node:fs"
import { defineOption } from "cmdore"
import { scan } from "@/utilities/fs"


export default defineOption({
    name: "subtitles",
    alias: "s",
    description: "path to directory containing subtitle files to be included in the merge",
    resumable: true,
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
        return pathnames.map(scan)
    }
})
