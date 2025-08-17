import { cyan } from "logtint"

export const executing = (binary: string, args: unknown[]) => {
    return `Executing: ${cyan(binary)} ${args.join(" ")}`
}

export const success = (filename: string, date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `Successfully completed ${cyan`"${filename}"`} at ${hours}:${minutes}.`
}