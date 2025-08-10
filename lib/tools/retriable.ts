import { terminal } from "cmdore"
import { wait } from "@/utilities/promise"


export const retriable = <TReturnValue, TArgs extends readonly unknown[]>(
    callback: (...varargs: TArgs) => Promise<TReturnValue>,
    retries: number = 5
) => {
    return async function r(this: unknown, ...varargs: TArgs): Promise<TReturnValue> {
        if (retries < 0) {
            return callback(...varargs)
        }
        try {
            return await callback(...varargs)
        } catch {
            terminal.verbose(`Retrying... (${retries} attempts left)`)
            await wait(10_000)
            retries--
            return r.call(this, ...varargs)
        }
    }
}


export default retriable
