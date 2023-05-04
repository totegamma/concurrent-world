import { useReducer } from 'react'

export interface IuseObjectList<T> {
    current: T[]
    push: (e: T) => void
    concat: (e: T[]) => void
    update: (updater: (e: T[]) => T[]) => void
    clear: () => void
}

interface objectListAction<T> { // FIXME: これもっと賢い型の定義方法あったよね？
    type: 'push' | 'concat' | 'update' | 'clear'
    argT?: T
    argTarr?: T[]
    argTcall?: (e: T[]) => T[]
}

export function useObjectList<T> (): IuseObjectList<T> {
    const [current, dispatch] = useReducer((old: T[], action: objectListAction<T>): T[] => {
        switch (action.type) {
            case 'push':
                if (action.argT) return [...old, action.argT]
                else return old
            case 'concat':
                if (action.argTarr) return [...old, ...action.argTarr]
                else return old
            case 'update':
                if (action.argTcall) return action.argTcall(old)
                else return old
            case 'clear':
                return []
        }
    }, [])

    const push = (e: T): void => {
        dispatch({
            type: 'push',
            argT: e
        })
    }

    const concat = (e: T[]): void => {
        dispatch({
            type: 'concat',
            argTarr: e
        })
    }

    const update = (updater: (e: T[]) => T[]): void => {
        dispatch({
            type: 'update',
            argTcall: updater
        })
    }

    const clear = (): void => {
        dispatch({
            type: 'clear'
        })
    }

    return {
        current,
        push,
        concat,
        update,
        clear
    }
}
