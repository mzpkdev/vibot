import { defineOption, terminal } from "cmdore"
import * as fs from "node:fs"
import * as path from "node:path"
import trash from "trash"


export default defineOption({
    name: "output",
    alias: "o",
    required: true,
    description: "path to directory where processed files will be saved",
    validate: async (pathname) => {
        if (!fs.existsSync(pathname)) {
            return true
        }
        const files = fs.readdirSync(pathname)
            .map(file => path.join(pathname, file))
        if (files.length > 0) {
            const toRemove = await terminal.prompt(
                `Directory "${pathname}" cannot contain files. Do you want to delete them?`,
                answer => /^(y|yes)$/i.test(answer)
            )
            if (toRemove) {
                terminal.verbose(`Moving ${files.length} files from "${pathname}" directory to trash.`)
                await trash(files)
            } else {
                throw new Error(`Directory "${pathname}" must be empty.`)
            }
        }
    },
    parse: (pathname) => {
        return path.normalize(pathname)
    }
})
