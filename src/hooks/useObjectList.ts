import { useReducer } from 'react'

export interface IuseObjectList<T> {
    current: T[]
    pushFront: (e: T) => void
    pushBack: (e: T) => void
    concat: (e: T[]) => void
    update: (updater: (e: T[]) => T[]) => void
    clear: () => void
}

interface objectListAction<T> {
    // FIXME: これもっと賢い型の定義方法あったよね？
    type: 'push_front' | 'push_back' | 'concat' | 'update' | 'clear'
    argT?: T
    argTarr?: T[]
    argTcall?: (e: T[]) => T[]
}

export function useObjectList<T>(): IuseObjectList<T> {
    const [current, dispatch] = useReducer(
        (old: T[], action: objectListAction<T>): T[] => {
            switch (action.type) {
                case 'push_front':
                    if (action.argT) return [action.argT, ...old]
                    else return old
                case 'push_back':
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
        },
        []
    )

    const pushFront = (e: T): void => {
        dispatch({
            type: 'push_front',
            argT: e
        })
    }

    const pushBack = (e: T): void => {
        dispatch({
            type: 'push_back',
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
        pushFront,
        pushBack,
        concat,
        update,
        clear
    }
}
