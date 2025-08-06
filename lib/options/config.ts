import { defineOption } from "cmdore"


export default defineOption({
    name: "config",
    alias: "c",
    description: "specify configuration options for commands in key:value format",
    defaultValue: () => {
        return {}
    },
    parse: (...configs) => {
        return Object.fromEntries(
            configs
                .map(config => config.split(":"))
                .map(([ property, value = null ]) => {
                    if (!Number.isNaN(Number(value))) {
                        return [ property, Number(value) ]
                    }
                    if (value == null) {
                        return [ property, true ]
                    }
                    return [ property, String(value).toUpperCase() ]
                })
        )
    }
})
