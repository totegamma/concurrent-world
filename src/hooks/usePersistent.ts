import { useCallback, useState } from 'react'
function parseJsonSafely(input: string): any {
    let parsed: any = null
    try {
        parsed = JSON.parse(input)
    } catch (e) {
        // Do nothing ;)
    }
    return parsed
}

export function usePersistent<T>(key: string, init: T): [value: T, update: (newValue: T) => void] {
    const [value, setValue] = useState<T>(
        (() => {
            const cached = localStorage.getItem(key)
            if (cached) {
                return parseJsonSafely(cached) ?? init
            } else {
                localStorage.setItem(key, JSON.stringify(init))
                return init
            }
        })()
    )

    const update = useCallback((newValue: T): void => {
        setValue(newValue)
        localStorage.setItem(key, JSON.stringify(newValue))
    }, [])

    return [value, update]
}
