import * as fs from "node:fs"
import { defineOption } from "cmdore"
import { scan } from "@/utilities/fs"


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
        return pathnames.map(scan)
    }
})
