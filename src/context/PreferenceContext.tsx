import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePersistent } from '../hooks/usePersistent'
import { useApi } from './api'
import { type s3Config, type StreamList } from '../model'

import BubbleSound from '../resources/Bubble.wav'
import NotificationSound from '../resources/Notification.wav'

interface PreferenceState {
    themeName: string
    setThemeName: (_: string) => void

    customTheme: any
    setCustomTheme: (_: any) => void

    storageProvider: 'imgur' | 's3' | 'domain'
    setStorageProvider: (_: string) => void

    imgurClientID: string
    setImgurClientID: (_: string) => void

    s3Config: s3Config
    setS3Config: (_: s3Config) => void

    mediaProxy: string
    setMediaProxy: (_: string) => void

    devMode: boolean
    setDevMode: (_: boolean) => void

    showEditorOnTop: boolean
    setShowEditorOnTop: (_: boolean) => void

    showEditorOnTopMobile: boolean
    setShowEditorOnTopMobile: (_: boolean) => void

    lists: Record<string, StreamList>
    setLists: (_: Record<string, StreamList>) => void
    updateList: (id: string, newList: StreamList) => void

    emojiPackages: string[]
    setEmojiPackages: (_: string[]) => void

    postSound: any
    setPostSound: (sound: any) => void
    notificationSound: any
    setNotificationSound: (sound: any) => void
    volume: number
    setVolume: (volume: number) => void
}

const PreferenceContext = createContext<PreferenceState | undefined>(undefined)

interface PreferenceProviderProps {
    children: JSX.Element
}

export const PreferenceProvider = (props: PreferenceProviderProps): JSX.Element => {
    const client = useApi()

    const [initialized, setInitialized] = useState<boolean>(false)
    const [themeName, setThemeName] = usePersistent<string>('themeName', 'basic')
    const [customTheme, setCustomTheme] = usePersistent<any>('customTheme', undefined)

    const [storageProvider, _setStorageProvider] = usePersistent<'imgur' | 's3' | 'domain'>('storageProvider', 'domain')
    const setStorageProvider = useCallback(
        (v: string) => {
            console.log(v)
            _setStorageProvider(v as 'imgur' | 's3' | 'domain')
        },
        [_setStorageProvider]
    )

    const [imgurClientID, setImgurClientID] = usePersistent<string>('imgurClientID', '')
    const [s3Config, setS3Config] = usePersistent<s3Config>('s3Settings', {
        endpoint: '',
        accessKeyId: '',
        bucketName: '',
        publicUrl: '',
        secretAccessKey: '',
        forcePathStyle: false
    })

    const [mediaProxy, setMediaProxy] = usePersistent<string>('mediaProxy', 'https://urlpreview.kokoa.dev/')
    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>('defaultPostNonHome', [])
    const [devMode, setDevMode] = usePersistent<boolean>('devMode', false)
    const [showEditorOnTop, setShowEditorOnTop] = usePersistent<boolean>('showEditorOnTop', true)
    const [showEditorOnTopMobile, setShowEditorOnTopMobile] = usePersistent<boolean>('showEditorOnTopMobile', false)
    const [lists, setLists] = usePersistent<Record<string, StreamList>>('lists', {
        home: {
            label: 'Home',
            pinned: true,
            streams: [],
            userStreams: [],
            expanded: false,
            defaultPostStreams: []
        }
    })
    const [emojiPackages, setEmojiPackages] = usePersistent<string[]>('emojiPackages', [
        'https://gist.githubusercontent.com/totegamma/6e1a047f54960f6bb7b946064664d793/raw/twemoji.json'
    ]) // default twemoji

    const [postSound, setPostSound] = usePersistent<any>('PostSound', BubbleSound)
    const [notificationSound, setNotificationSound] = usePersistent<any>('NotificationSound', NotificationSound)
    const [volume, setVolume] = usePersistent<number>('Volume', 50)

    useEffect(() => {
        if (!client) return
        if (initialized) return
        client.api
            .readKV('world.concurrent.preference')
            .then((storage: string | null | undefined) => {
                setInitialized(true)
                if (!storage) return
                const parsed = JSON.parse(storage)
                parsed.themeName && setThemeName(parsed.themeName)
                parsed.storageProvider && setStorageProvider(parsed.storageProvider)
                parsed.imgurClientID && setImgurClientID(parsed.imgurClientID)
                parsed.s3Config && setS3Config(parsed.s3Config)
                parsed.mediaProxy && setMediaProxy(parsed.mediaProxy)
                parsed.defaultPostHome && setDefaultPostHome(parsed.defaultPostHome)
                parsed.defaultPostNonHome && setDefaultPostNonHome(parsed.defaultPostNonHome)
                parsed.devMode && setDevMode(parsed.devMode)
                parsed.showEditorOnTop && setShowEditorOnTop(parsed.showEditorOnTop)
                parsed.showEditorOnTopMobile && setShowEditorOnTopMobile(parsed.showEditorOnTopMobile)
                parsed.lists && setLists(parsed.lists)
                parsed.emojiPackages && setEmojiPackages(parsed.emojiPackages)
            })
            .catch((e: any) => {
                setInitialized(true)
                console.log(e)
            })
    }, [])

    const updateList = useCallback(
        (id: string, newList: StreamList) => {
            const old = lists
            old[id] = newList
            setLists(JSON.parse(JSON.stringify(old)))
        },
        [lists]
    )

    useEffect(() => {
        if (!client) return
        if (!initialized) return
        const storage = JSON.stringify({
            themeName,
            storageProvider,
            imgurClientID,
            s3Config,
            defaultPostHome,
            defaultPostNonHome,
            devMode,
            showEditorOnTop,
            showEditorOnTopMobile,
            lists,
            emojiPackages
        })
        client.api.writeKV('world.concurrent.preference', storage)
    }, [
        themeName,
        storageProvider,
        imgurClientID,
        s3Config,
        defaultPostHome,
        defaultPostNonHome,
        devMode,
        showEditorOnTop,
        showEditorOnTopMobile,
        lists,
        emojiPackages
    ])

    const value = useMemo(() => {
        return {
            themeName,
            setThemeName,
            customTheme,
            setCustomTheme,
            storageProvider,
            setStorageProvider,
            imgurClientID,
            setImgurClientID,
            s3Config,
            setS3Config,
            mediaProxy,
            setMediaProxy,
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
            updateList,
            emojiPackages,
            setEmojiPackages,
            postSound,
            setPostSound,
            notificationSound,
            setNotificationSound,
            volume,
            setVolume
        }
    }, [
        themeName,
        customTheme,
        storageProvider,
        imgurClientID,
        s3Config,
        defaultPostHome,
        defaultPostNonHome,
        devMode,
        showEditorOnTop,
        showEditorOnTopMobile,
        lists,
        emojiPackages,
        postSound,
        notificationSound,
        volume
    ])

    return <PreferenceContext.Provider value={value}>{props.children}</PreferenceContext.Provider>
}

export function usePreference(): PreferenceState {
    return useContext(PreferenceContext) as PreferenceState
}
