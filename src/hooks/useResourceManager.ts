import { useRef } from 'react'

export interface IuseResourceManager<T> {
    current: Record<string, T>
    get: (key: string) => Promise<T>
    register: (key: string, value: T) => void
    invalidate: (key: string) => void
}

export function useResourceManager<T>(
    resolver: (key: string) => Promise<T>
): IuseResourceManager<T> {
    const body = useRef<Record<string, T>>({})

    const get = async (key: string): Promise<T> => {
        if (!(key in body.current)) {
            body.current[key] = await resolver(key)
        }
        return body.current[key]
    }

    const register = (key: string, value: T): void => {
        body.current[key] = value
    }

    const invalidate = (key: string): void => {
        delete body.current[key]
    }

    return {
        current: body.current,
        get,
        register,
        invalidate
    }
}

export const dummyResourceManager: IuseResourceManager<any> = {
    current: {},
    get: async () => {
        throw new Error('ResourceManager not initialized get')
    },
    register: (key: string, value: any) => {
        throw new Error('ResourceManager not initialized register')
    },
    invalidate: (key: string) => {
        throw new Error('ResourceManager not initialized invalidate')
    }
}
