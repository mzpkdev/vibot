import { AudioCodec, Chainable, ExecutableOption, extractJSON, spawn, TrackType } from "../core/executables"


const ffprobe = async <TReturnValue>(input: string, probe?: Chainable<ExecutableOption<TReturnValue>>): Promise<TReturnValue> => {
    const { argument = [], parse } = await probe?.(input) ?? {}
    const stdout = await spawn("ffprobe", [
        [ `-hide_banner`, `-v quiet`, `-i`, `"${input}"` ],
        argument
    ])
    return parse?.(stdout) as TReturnValue
}

export type StreamInfo = {
    index: number
    codec: AudioCodec
    channels: number
    sampleRate: number
}

export const duration = (): Chainable<ExecutableOption<string>> =>
    async () => {
        return {
            argument: [
                [ `-show_entries`, `format=duration` ],
                [ `-of`, `csv="p=0"` ]
            ],
            parse: (output: string) => output
        }
    }

export const info = (type: TrackType): Chainable<ExecutableOption<StreamInfo[]>> =>
    async () => {
        return {
            argument: [
                [ `-select_streams`, type ],
                [ `-show_entries`, `stream=index,codec_name,channels,sample_rate` ],
                [ `-of`, `json` ]
            ],
            parse: (output: string) => {
                const data = extractJSON(output)
                return (data?.streams ?? []).map((stream: Record<string, string>) => ({
                    index: Number(stream.index),
                    codec: stream.codec_name,
                    channels: Number(stream.channels),
                    sampleRate: Number(stream.sample_rate)
                }))
            }
        }
    }


export default ffprobe
