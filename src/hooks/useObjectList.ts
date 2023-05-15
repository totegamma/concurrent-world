import { useCallback, useMemo, useReducer } from 'react'

export interface IuseObjectList<T> {
    current: T[]
    set: (e: T[]) => void
    pushFront: (e: T) => void
    pushBack: (e: T) => void
    concat: (e: T[]) => void
    update: (updater: (e: T[]) => T[]) => void
    clear: () => void
}

interface objectListAction<T> {
    // FIXME: これもっと賢い型の定義方法あったよね？
    type: 'set' | 'push_front' | 'push_back' | 'concat' | 'update' | 'clear'
    argT?: T
    argTarr?: T[]
    argTcall?: (e: T[]) => T[]
}

export function useObjectList<T>(): IuseObjectList<T> {
    const [current, dispatch] = useReducer(
        (old: T[], action: objectListAction<T>): T[] => {
            switch (action.type) {
                case 'set':
                    if (action.argTarr) return [...action.argTarr]
                    else return old
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

    const set = useCallback((e: T[]): void => {
        dispatch({
            type: 'set',
            argTarr: e
        })
    }, [])

    const pushFront = useCallback((e: T): void => {
        dispatch({
            type: 'push_front',
            argT: e
        })
    }, [])

    const pushBack = useCallback((e: T): void => {
        dispatch({
            type: 'push_back',
            argT: e
        })
    }, [])

    const concat = useCallback((e: T[]): void => {
        dispatch({
            type: 'concat',
            argTarr: e
        })
    }, [])

    const update = useCallback((updater: (e: T[]) => T[]): void => {
        dispatch({
            type: 'update',
            argTcall: updater
        })
    }, [])

    const clear = useCallback((): void => {
        dispatch({
            type: 'clear'
        })
    }, [])

    return useMemo(
        () => ({
            current,
            set,
            pushFront,
            pushBack,
            concat,
            update,
            clear
        }),
        [set, current, pushFront, pushBack, concat, update, clear]
    )
}
