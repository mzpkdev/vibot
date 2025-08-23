import { Chainable, ExecutableOption, spawn } from "../core/executables"


const mkvmerge = async <TReturnValue>(
    output: string,
    ...options: (Chainable<ExecutableOption> | null | undefined)[]
): Promise<TReturnValue> => {
    const [ head, ...tail ] = options
    const { argument = [], parse } = await head?.(output) ?? {}
    const stdout = await spawn("mkvmerge", [
        [ `--output`, `"${output}"` ],
        argument,
        ...(await Promise.all(
            tail
                .filter(option => !!option)
                .map(option => option?.(output))
        ))
            .map(option => option.argument ?? [])
    ])
    return parse?.(stdout) as TReturnValue
}

export type TrackMetadata = {
    index?: number
    title?: string
    language?: string
    defaults?: boolean
}

export const tracks = (tracks: string[]): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `--tracks`, tracks.join(",") ]
            ]
        }
    }

export const track = (input: string, metadata: TrackMetadata): Chainable<ExecutableOption> =>
    async () => {
        const { index = 0, title = "", language, defaults } = metadata
        return {
            argument: [
                [ `--track-name`, `${index}:"${title}"` ],
                [ `--language`, `${index}:${parse.language(language)}` ],
                [ `--default-track`, `${index}:${parse.boolean(defaults)}` ],
                [ `"${input}"` ]
            ]
        }
    }

export const file = (input: string): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `"${input}"` ]
            ]
        }
    }

export const clean = (exclude: string[] = []): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ "--video-tracks 0" ],
                [ "--language 0:und" ],
                [ `--track-name 0:""` ],
                [ `--default-track 0:yes` ],
                [ `--title ""` ],
                [ `--no-attachments` ],
                [ `--no-global-tags` ],
                ...exclude
                    .map<[ string ]>(type => [ `--no-${type}` ])
            ]
        }

    }

const parse = {
    boolean: (value?: boolean) =>
        value ? "yes" : "no",
    language: (value?: string) =>
        value ? value : "und"
}


export default mkvmerge
