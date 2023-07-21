import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePersistent } from '../hooks/usePersistent'
import { useApi } from './api'
import { type StreamList } from '../model'

interface PreferenceState {
    themeName: string
    setThemeName: (_: string) => void

    imgurClientID: string
    setImgurClientID: (_: string) => void

    devMode: boolean
    setDevMode: (_: boolean) => void

    showEditorOnTop: boolean
    setShowEditorOnTop: (_: boolean) => void

    showEditorOnTopMobile: boolean
    setShowEditorOnTopMobile: (_: boolean) => void

    lists: Record<string, StreamList>
    setLists: (_: Record<string, StreamList>) => void
    updateList: (id: string, newList: StreamList) => void
}

const PreferenceContext = createContext<PreferenceState | undefined>(undefined)

interface PreferenceProviderProps {
    children: JSX.Element
}

export const PreferenceProvider = (props: PreferenceProviderProps): JSX.Element => {
    const client = useApi()

    const [initialized, setInitialized] = useState<boolean>(false)

    const [themeName, setThemeName] = usePersistent<string>('themeName', 'basic')
    const [imgurClientID, setImgurClientID] = usePersistent<string>('imgurClientID', '')
    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>('defaultPostNonHome', [])
    const [devMode, setDevMode] = usePersistent<boolean>('devMode', false)
    const [showEditorOnTop, setShowEditorOnTop] = usePersistent<boolean>('showEditorOnTop', true)
    const [showEditorOnTopMobile, setShowEditorOnTopMobile] = usePersistent<boolean>('showEditorOnTopMobile', false)
    const [lists, setLists] = usePersistent<Record<string, StreamList>>('lists', {})

    useEffect(() => {
        if (!client) return
        if (initialized) return
        client.api
            .readKV('world.concurrent.preference')
            .then((storage: string | undefined) => {
                setInitialized(true)
                if (!storage) return
                const parsed = JSON.parse(storage)
                setThemeName(parsed.themeName ?? 'basic')
                setImgurClientID(parsed.imgurClientID ?? '')
                setDefaultPostHome(parsed.defaultPostHome ?? [])
                setDefaultPostNonHome(parsed.defaultPostNonHome ?? [])
                setDevMode(parsed.devMode ?? false)
                setShowEditorOnTop(parsed.showEditorOnTop ?? true)
                setShowEditorOnTopMobile(parsed.showEditorOnTopMobile ?? false)
                setLists(parsed.lists ?? {})
            })
            .catch((e) => {
                setInitialized(true)
                console.log(e)
            })
    }, [])

    const updateList = useCallback((id: string, newList: StreamList) => {
        const old = lists
        old[id] = newList
        setLists(JSON.parse(JSON.stringify(old)))
    }, [])

    useEffect(() => {
        if (!client) return
        if (!initialized) return
        const storage = JSON.stringify({
            themeName,
            imgurClientID,
            defaultPostHome,
            defaultPostNonHome,
            devMode,
            showEditorOnTop,
            showEditorOnTopMobile,
            lists
        })
        client.api.writeKV('world.concurrent.preference', storage)
    }, [
        themeName,
        imgurClientID,
        defaultPostHome,
        defaultPostNonHome,
        devMode,
        showEditorOnTop,
        showEditorOnTopMobile,
        lists
    ])

    const value = useMemo(() => {
        return {
            themeName,
            setThemeName,
            imgurClientID,
            setImgurClientID,
            defaultPostHome,
            setDefaultPostHome,
            defaultPostNonHome,
            setDefaultPostNonHome,
            devMode,
            setDevMode,
            showEditorOnTop,
            setShowEditorOnTop,
            showEditorOnTopMobile,
            setShowEditorOnTopMobile,
            lists,
            setLists,
            updateList
        }
    }, [
        themeName,
        setThemeName,
        imgurClientID,
        setImgurClientID,
        defaultPostHome,
        setDefaultPostHome,
        defaultPostNonHome,
        setDefaultPostNonHome,
        devMode,
        setDevMode,
        showEditorOnTop,
        setShowEditorOnTop,
        showEditorOnTopMobile,
        setShowEditorOnTopMobile,
        lists,
        setLists,
        updateList
    ])

    return <PreferenceContext.Provider value={value}>{props.children}</PreferenceContext.Provider>
}

export function usePreference(): PreferenceState {
    return useContext(PreferenceContext) as PreferenceState
}
