import { defineOption } from "cmdore"


export default defineOption({
    name: "config",
    alias: "c",
    description: "specify configuration options for commands in key:value format",
    resumable: true,
    defaultValue: () => {
        return {}
    },
    parse: (...configs) => {
        return Object.fromEntries(
            configs
                .map(config => config.split(":"))
                .map(([ property, value = null ]) => {
                    if (!Number.isNaN(Number(value))) {
                        return [ property.toLowerCase(), Number(value) ]
                    }
                    if (value == null) {
                        return [ property.toLowerCase(), true ]
                    }
                    return [ property.toLowerCase(), String(value).toUpperCase() ]
                })
        )
    }
})
