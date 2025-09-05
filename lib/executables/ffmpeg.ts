import {
    AudioCodec,
    Bitrate,
    Chainable,
    CopyCodec,
    ExecutableOption,
    extractJSON,
    spawn,
    TrackType, VideoCodec
} from "../core/executables"


const ffmpeg = async <TReturnValue>(
    input: string,
    output: string | null,
    option?: Chainable<ExecutableOption<TReturnValue>>,
    ...options: Chainable<ExecutableOption>[]
): Promise<TReturnValue> => {
    const { argument = [], parse } = await option?.(input) ?? {}
    const awaited: ExecutableOption[] = []
    for (const option of options) {
        awaited.push(await option?.(input))
    }
    const muxer = /\S+:s/.test(argument.join(" ")) ? "srt" : "null"
    const stdout = await spawn("ffmpeg", [
        [ `-y`, `-hide_banner`, `-i`, `"${input}"` ],
        argument,
        ...awaited
            .map(option => option.argument ?? []),
        [ output === null ? `-f ${muxer} -` : `"${output}"` ]
    ])
    return (parse?.(stdout) ?? stdout) as TReturnValue
}


export type FilterArgument = string

export enum Preset {
    ULTRA_FAST = "ultrafast",
    SUPER_FAST = "superfast",
    VERY_FAST = "veryfast",
    FASTER = "faster",
    FAST = "fast",
    MEDIUM = "medium",
    SLOW = "slow",
    SLOWER = "slower",
    VERY_SLOW = "veryslow"
}

export enum Tune {
    FILM = "film",
    ANIMATION = "animation",
    GRAIN = "grain",
    STILL_IMAGE = "stillimage",
    FAST_DECODE = "fastdecode ",
    ZERO_LATENCY = "zerolatency ",
}

export const QUALITY_LEVEL = {
    LOW: 22,
    MEDIUM: 20,
    HIGH: 18
} as const

export enum Encoder {
    H264 = "H264",
    H265 = "H265"
}

export enum EncoderPreset {
    STANDARD = "STANDARD",
    GRAINY = "GRAINY",
    ANIMATION = "ANIMATION",
    STANDARD_4K = "STANDARD_4K",
    GRAINY_4K = "GRAINY_4K",
    ANIMATION_4K = "ANIMATION_4K"
}

// export enum OptionsH265_ {
// 	STANDARD_4K = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=2:rdoq-level=2:psy-rd=2:psy-rdoq=1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:qcomp=0.64",
// 	GRAINY_4K = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=4:limit-tu=2:qcomp=0.60:aq-strength=0.65",
//
// 	STANDARD = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=2:rdoq-level=2:psy-rd=1.2:psy-rdoq=1.1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:qcomp=0.64:ctu=32:merange=26",
// 	GRAINY = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=4:limit-tu=2:qcomp=0.60:ctu=32:merange=26",
//
// 	ANIMATION = "rc-lookahead=40:b-adapt=2:bframes=8:limit-sao:qcomp=0.70:rskip=1:rskip-edge-threshold=2:rd=4:rdoq-level=2:psy-rd=2:psy-rdoq=1.1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:tskip:aq-mode=3:aq-strength=0.7:ctu=32:merange=26",
// 	ANIMATION_4K = "rc-lookahead=40:b-adapt=2:bframes=8:limit-sao:qcomp=0.70:rskip=1:rskip-edge-threshold=2:rd=4:rdoq-level=2:psy-rd=2:psy-rdoq=1.1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:tskip:aq-mode=3:aq-strength=0.7",
//
// 	STANDARD_STREAM_OPTIMIZED = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=2:rdoq-level=2:psy-rd=1.2:psy-rdoq=1.1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:qcomp=0.60:ctu=32:merange=26:vbv-maxrate=9856:vbv-bufsize=19712",
// 	GRAINY_STREAM_OPTIMIZED = "rc-lookahead=40:b-adapt=2:bframes=6:no-sao:rskip=2:rskip-edge-threshold=4:limit-tu=2:qcomp=0.60:ctu=32:merange=26:vbv-maxrate=9856:vbv-bufsize=19712",
// 	ANIMATION_STREAM_OPTIMIZED = "rc-lookahead=40:b-adapt=2:bframes=8:limit-sao:qcomp=0.70:rskip=1:rskip-edge-threshold=2:rd=4:rdoq-level=2:psy-rd=2:psy-rdoq=1.1:tu-intra-depth=4:tu-inter-depth=4:limit-tu=2:tskip:aq-mode=3:aq-strength=0.7:ctu=32:merange=26:vbv-maxrate=9472:vbv-bufsize=18944",
// }

export type OptionsH264 = {
    "aq-mode"?: number
    "aq-strength"?: number
    "b-adapt"?: number
    "bframes"?: number
    "merange"?: number
    "psy-rd"?: number
    "psy-trellis"?: number
    "trellis"?: number
    "qcomp"?: number
    "rc-lookahead"?: number
    "rd"?: number
    "vbv-bufsize"?: number
    "vbv-maxrate"?: number
}

export type OptionsH265 = OptionsH264 & {
    "ctu"?: number
    "limit-sao"?: boolean
    "limit-tu"?: number
    "no-sao"?: boolean
    "psy-rdoq"?: number
    "rdoq-level"?: number
    "rskip"?: number
    "rskip-edge-threshold"?: number
    "tskip"?: boolean
    "tu-intra-depth"?: number
    "tu-inter-depth"?: number
}

export type EncodeH264 = {
    preset: Preset
    tune: Tune
    h264params: string
}

const stringify = (options: OptionsH264 | OptionsH265): string => {
    return Object.entries(options)
        .map(([ property, value ]) =>
            typeof value === "boolean" && value
                ? property
                : `${property}=${value}`)
        .join(":")
}

namespace EncodeH264 {
    export const isEncodeH264 = <TEncode extends Record<PropertyKey, unknown>>(encode: TEncode | EncodeH264): encode is EncodeH264 => {
        return !!(encode?.h264params && typeof encode?.h264params === "string")
    }

    export const create = (preset: Preset, tune: Tune, h264params: OptionsH264 = {}): EncodeH264 => {
        const base: OptionsH264 = {
            "rc-lookahead": 40,
            "b-adapt": 2
        }
        return {
            preset,
            tune,
            h264params: stringify({ ...base, ...h264params })
        }
    }
}

export type EncodeH265 = {
    preset: Preset
    tune: Tune
    h265params: string
}

namespace EncodeH265 {
    export const isEncodeH265 = <TEncode extends Record<PropertyKey, unknown>>(encode: TEncode | EncodeH265): encode is EncodeH265 => {
        return !!(encode?.h265params && typeof encode?.h265params === "string")
    }

    export const create = (preset: Preset, tune: Tune, h265params: OptionsH265 = {}): EncodeH265 => {
        const base: OptionsH265 = {
            "rc-lookahead": 40,
            "b-adapt": 2,
            "limit-tu": 2
        }
        return {
            preset,
            tune,
            h265params: stringify({ ...base, ...h265params })
        }
    }
}

export const H264_PRESETS = {
    [EncoderPreset.STANDARD]: EncodeH264.create(Preset.SLOW, Tune.FILM, {
        "bframes": 6,
        "trellis": 2,
        "psy-rd": 1.2,
        "psy-trellis": 0.2,
        "qcomp": 0.64,
        "merange": 26
    }),
    [EncoderPreset.GRAINY]: EncodeH264.create(Preset.SLOW, Tune.GRAIN, {
        "bframes": 6,
        "qcomp": 0.60,
        "merange": 26
    }),
    [EncoderPreset.ANIMATION]: EncodeH264.create(Preset.SLOW, Tune.ANIMATION, {
        "bframes": 8,
        "rd": 4,
        "trellis": 2,
        "psy-rd": 2,
        "psy-trellis": 0.3,
        "qcomp": 0.70,
        "aq-mode": 3,
        "aq-strength": 0.7,
        "merange": 26
    }),
    [EncoderPreset.STANDARD_4K]: EncodeH264.create(Preset.SLOW, Tune.FILM, {
        "bframes": 6,
        "trellis": 2,
        "psy-rd": 2,
        "psy-trellis": 0.3,
        "qcomp": 0.64
    }),
    [EncoderPreset.GRAINY_4K]: EncodeH264.create(Preset.SLOW, Tune.GRAIN, {
        "bframes": 6,
        "qcomp": 0.60,
        "aq-strength": 0.65
    }),
    [EncoderPreset.ANIMATION_4K]: EncodeH264.create(Preset.SLOW, Tune.ANIMATION, {
        "bframes": 8,
        "rd": 4,
        "trellis": 2,
        "psy-rd": 2,
        "psy-trellis": 0.3,
        "qcomp": 0.70,
        "aq-mode": 3,
        "aq-strength": 0.7
    })
} as const

export const H265_PRESETS = {
    [EncoderPreset.STANDARD]: EncodeH265.create(Preset.SLOW, Tune.FILM, {
        "bframes": 6,
        "no-sao": true,
        "rskip": 2,
        "rskip-edge-threshold": 2,
        "rdoq-level": 2,
        "psy-rd": 1.2,
        "psy-rdoq": 1.1,
        "tu-intra-depth": 4,
        "tu-inter-depth": 4,
        "qcomp": 0.64,
        "ctu": 32,
        "merange": 26
    }),
    [EncoderPreset.GRAINY]: EncodeH265.create(Preset.SLOW, Tune.GRAIN, {
        "bframes": 6,
        "no-sao": true,
        "rskip": 2,
        "rskip-edge-threshold": 4,
        "qcomp": 0.60,
        "ctu": 32,
        "merange": 26
    }),
    [EncoderPreset.ANIMATION]: EncodeH265.create(Preset.SLOW, Tune.ANIMATION, {
        "bframes": 8,
        "limit-sao": true,
        "rskip": 1,
        "rskip-edge-threshold": 2,
        "rdoq-level": 2,
        "rd": 4,
        "psy-rd": 2,
        "psy-rdoq": 1,
        "tu-intra-depth": 4,
        "tu-inter-depth": 4,
        "qcomp": 0.70,
        "tskip": true,
        "aq-mode": 3,
        "aq-strength": 0.7,
        "ctu": 32,
        "merange": 26
    }),
    [EncoderPreset.STANDARD_4K]: EncodeH265.create(Preset.SLOW, Tune.FILM, {
        "bframes": 6,
        "no-sao": true,
        "rskip": 2,
        "rskip-edge-threshold": 2,
        "rdoq-level": 2,
        "psy-rd": 2,
        "psy-rdoq": 1,
        "tu-intra-depth": 4,
        "tu-inter-depth": 4,
        "qcomp": 0.64
    }),
    [EncoderPreset.GRAINY_4K]: EncodeH265.create(Preset.SLOW, Tune.GRAIN, {
        "bframes": 6,
        "no-sao": true,
        "rskip": 2,
        "rskip-edge-threshold": 4,
        "qcomp": 0.60,
        "aq-strength": 0.65
    }),
    [EncoderPreset.ANIMATION_4K]: EncodeH265.create(Preset.SLOW, Tune.ANIMATION, {
        "bframes": 8,
        "limit-sao": true,
        "rskip": 1,
        "rskip-edge-threshold": 2,
        "rdoq-level": 2,
        "rd": 4,
        "psy-rd": 2,
        "psy-rdoq": 1,
        "tu-intra-depth": 4,
        "tu-inter-depth": 4,
        "qcomp": 0.70,
        "tskip": true,
        "aq-mode": 3,
        "aq-strength": 0.7
    })
} as const

export const ENCODER_PRESETS = {
    [Encoder.H264]: H264_PRESETS,
    [Encoder.H265]: H265_PRESETS
} as const

export const encode = (encode: EncodeH264 | EncodeH265, crf: number): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `-preset`, encode.preset ],
                [ `-tune`, encode.tune ],
                [ `-crf`, crf ],
                EncodeH264.isEncodeH264(encode) && [ `-x264-params`, `"${encode.h264params}"` ],
                EncodeH264.isEncodeH264(encode) && [ `-pix_fmt`, `yuv420p` ],
                EncodeH265.isEncodeH265(encode) && [ `-x265-params`, `"${encode.h265params}"` ]
            ]
        }
    }

export const filter = <TReturnValue>(index: number | null, ...filters: Chainable<FilterArgument>[]): Chainable<ExecutableOption<TReturnValue>> =>
    async (input) => {
        return {
            argument: [
                [
                    index === null ? `-filter:a` : `-filter:a:${index}`,
                    `"${(await Promise.all(filters.map(filter => filter(input, { index })))).join(",")}"`
                ]
            ]
        }
    }

export const extract = (index: number | null = null, type: TrackType): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `-map`, index === null ? `0:${type}` : `0:${type}:${index}` ],
                type === TrackType.AUDIO && [ `-c:a`, `copy` ]
            ],
            parse: (output: string) => {
                const re = /to '([^']+)'/
                const match = output.match(re)
                if (match) {
                    return match[1]
                }
                return null
            }
        }
    }

export const ar = (rate: number): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `-ar`, String(rate) ]
            ]
        }
    }

export const map = (index: number | null, type?: TrackType): Chainable<ExecutableOption<string>> =>
    async () => {
        return {
            argument: [
                [ `-map`, type
                    ? index === null
                        ? `0:${type}?`
                        : `0:${type}:${index}`
                    : `0`
                ]
            ]
        }
    }

export const copy = (index: number | null, type: TrackType): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ index === null ? `-c:${type}` : `-c:${type}:${index}`, `copy` ]
            ]
        }
    }

export const codec = (index: number | null, type: TrackType, codec: VideoCodec | AudioCodec | CopyCodec): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ index === null ? `-c:${type}` : `-c:${type}:${index}`, codec ],
                codec === AudioCodec.OPUS && [ `-mapping_family`, 1 ]
            ]
        }
    }

codec.copy = (): CopyCodec => {
    return "copy"
}

codec.audio = (codec: AudioCodec, channels: number) => {
    switch (channels) {
        case 1:
        case 2:
            switch (codec) {
                default:
                    return AudioCodec.AAC
            }
        case 4:
        case 5:
        case 6:
            switch (codec) {
                default:
                    return AudioCodec.AC3
            }
        case 8:
        default:
            throw new Error(`Unsupported audio configuration: ${channels} channels with codec ${codec}. Please use a supported channel count (1, 2, 4, 5, or 6) or a different codec.`)
    }
}

export const bitrate = (index: number | null, type: TrackType, bitrate: Bitrate): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ index === null ? `-b:${type}` : `-b:${type}:${index}`, bitrate ]
            ]
        }
    }

bitrate.audio = (codec: AudioCodec, channels: number) => {
    switch (channels) {
        case 1:
        case 2:
            switch (codec) {
                case AudioCodec.FLAC:
                    return Bitrate.B320K
                default:
                    return Bitrate.B192K
            }
        case 4:
        case 5:
        case 6:
            switch (codec) {
                case AudioCodec.TRUEHD:
                case AudioCodec.DTS_HD:
                case AudioCodec.DTS:
                case AudioCodec.FLAC:
                    return Bitrate.B640K
                case AudioCodec.EAC3:
                    return Bitrate.B448K
                default:
                    return Bitrate.B384K
            }
        case 8:
        default:
            throw new Error(`Unsupported bitrate configuration: ${channels} channels with codec ${codec}. Please use a supported channel count (1, 2, 4, 5, or 6) or a different codec for bitrate selection.`)
    }
}

export const ac = (channels: number): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `-ac`, channels ]
            ]
        }
    }

export const mappingfamily = (family: number): Chainable<ExecutableOption> =>
    async () => {
        return {
            argument: [
                [ `-mapping_family`, family ]
            ]
        }
    }

export const loudnorm = (): Chainable<FilterArgument> =>
    async (input, { index } = {}) => {
        const analyze = (): Chainable<FilterArgument> => {
            return async () => {
                return `loudnorm=print_format=json`
            }
        }
        const text = await ffmpeg<string>(
            input, null,
            map(index, TrackType.AUDIO),
            filter(null, analyze())
        )
        const data = extractJSON(text)
        // if (VERBOSE() >= VerbosityLevel.MEDIUM) {
            console.debug(data)
        // }
        const defaults = {
            i: -23,
            tp: -2,
            lra: 15
        }
        return `loudnorm=` + [
            [ `I=${defaults.i}` ],
            [ `TP=${defaults.tp}` ],
            [ `LRA=${defaults.lra}` ],
            [ `offset=${data?.target_offset}` ],
            [ `measured_I=${data?.output_i}` ],
            [ `measured_tp=${data?.output_tp}` ],
            [ `measured_lra=${data?.output_lra}` ],
            [ `measured_thresh=${data?.output_thresh}` ],
            [ `linear=true` ],
            [ `print_format=summary` ]
        ].join(":")
    }


export default ffmpeg
