import * as child_process from "child_process"
import * as path from "path"
import { terminal } from "cmdore"
import { executing } from "@/messages"


export type ExecutableArgument =
    [ string, (string | number)? ] | false | undefined

export type ExecutableOption<TReturnValue = void> = {
    argument: ExecutableArgument[]
    parse?: (output: string) => TReturnValue
}

export enum TrackType {
    VIDEO = "v",
    AUDIO = "a",
    SUBTITLES = "s"
}

export enum VideoCodec {
    H264 = "libx264",
    H265 = "libx265"
}

export enum AudioCodec {
    AAC = "aac",
    AC3 = "ac3",
    EAC3 = "eac3",
    OPUS = "libopus",
    FLAC = "flac",
    DTS = "dts",
    DTS_HD = "dts_hd",
    TRUEHD = "truehd"
}

export type CopyCodec =
    "copy"

export enum Bitrate {
    B64K = "64k",
    B96K = "96k",
    B128K = "128k",
    B160K = "160k",
    B192K = "192k",
    B256K = "256k",
    B320K = "320k",
    B384K = "384k",
    B448K = "448k",
    B512K = "512k",
    B640K = "640k",
    B768K = "768k"
}

export type Chainable<TReturnValue> =
    (target: string, other?: Record<string, any>) => Promise<TReturnValue>

type ExecuteArgs =
    string | number | undefined | false | ExecuteArgs[]

export const spawn = async (binary: string, args: ExecuteArgs[]): Promise<string> => {
    const binaryNormalized = requireStaticBinary(binary)
    const argsNormalized = args
        .flat(5)
        .filter((arg): arg is string => !!arg)
        .map((arg) => String(arg).replaceAll(/""([^"]+)""/g, `"$1"`))
    terminal.verbose(executing(binary, argsNormalized))
    const stream = child_process.spawn(
        binaryNormalized,
        argsNormalized,
        { shell: true }
    )
    const output: string[] = []
    return new Promise<string>((resolve, reject) => {
        stream.stdout.on("data", (data) => {
            const text = String(data)
            output.push(text)
        })
        stream.stderr.on("data", (data) => {
            const text = String(data)
            output.push(text)
        })
        stream.on("close", (code) => {
            const text = output.join("\n")
            if (code === 0) {
                resolve(text)
            } else {
                reject(text)
            }
        })
        stream.on("error", (error) => {
            reject(error)
        })
    })
}

const requireStaticBinary = (name: string): string => {
    try {
        const executable = require(`${name}-static`)
        if (executable.path !== undefined) {
            return `"${path.normalize(executable.path)}"`
        } else {
            return `"${path.normalize(executable)}"`
        }
    } catch (error) {
        return name
    }
}

export const extractJSON = (text: string): Record<string, any> => {
    const [ json ] = text.match(/\{([\s\S]*)}/) ?? []
    if (!json) {
        return {}
    }
    return JSON.parse(json)
}
