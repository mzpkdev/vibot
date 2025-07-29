export function zip<T extends readonly unknown[][]>(
    ...arrays: T
): { [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never }[] {
    const normalized = arrays.map(array => array ?? [])
    const length = Math.max(...normalized.map(array => array.length))
    const zipped = Array.from({ length }, () => [] as unknown[])

    for (let i = 0; i < length; i++) {
        for (let j = 0; j < normalized.length; j++) {
            zipped[i][j] = normalized[j][i]
        }
    }

    return zipped as {
        [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never
    }[]
}
