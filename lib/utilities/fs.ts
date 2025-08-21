import * as fs from "node:fs"
import * as path from "node:path"


// TODO: rething naming of this one
export const scan = (pathname: string): string[] => {
    const stats = fs.statSync(pathname)
    if (stats.isFile()) {
        return [ pathname ]
    }
    return fs.readdirSync(pathname)
        .filter(filename => !filename.startsWith("."))
        .sort((a, b) => a.localeCompare(b))
        .map(filename => path.join(pathname, filename))
}