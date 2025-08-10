import { terminal } from "cmdore"
import { wait } from "@/utilities/promise"


export const retriable = <TReturnValue, TArgs extends readonly unknown[]>(
    callback: (...varargs: TArgs) => Promise<TReturnValue>,
    retries: number = 5
) => {
    return async function r(...varargs: TArgs): Promise<TReturnValue> {
        if (retries < 0) {
            return callback(...varargs)
        }
        try {
            return await callback(...varargs)
        } catch {
            terminal.verbose(`Retrying...`)
            await wait(10_000)
            return retriable(callback, retries - 1)(...varargs)
        }
    }
}


export default retriable