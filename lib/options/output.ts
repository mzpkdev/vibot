import { defineOption } from "cmdore"
import * as path from "node:path"


export default defineOption({
    name: "output",
    alias: "o",
    required: true,
    description: "path to directory where processed files will be saved",
    parse: (pathname) => {
        return path.normalize(pathname)
    }
})
