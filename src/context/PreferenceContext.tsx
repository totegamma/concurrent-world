import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePersistent } from '../hooks/usePersistent'
import { useApi } from './api'

interface PreferenceState {
    themeName: string
    setThemeName: (_: string) => void

    imgurClientID: string
    setImgurClientID: (_: string) => void

    followingUsers: string[]
    followUser: (_: string) => void
    unfollowUser: (_: string) => void

    followingStreams: string[]
    setFollowingStreams: (_: string[]) => void
    followStream: (_: string) => void
    unfollowStream: (_: string) => void

    bookmarkingStreams: string[]
    bookmarkStream: (_: string) => void
    unbookmarkStream: (_: string) => void

    defaultPostHome: string[]
    setDefaultPostHome: (_: string[]) => void
    defaultPostNonHome: string[]
    setDefaultPostNonHome: (_: string[]) => void

    devMode: boolean
    setDevMode: (_: boolean) => void

    showEditorOnTop: boolean
    setShowEditorOnTop: (_: boolean) => void

    showEditorOnTopMobile: boolean
    setShowEditorOnTopMobile: (_: boolean) => void
}

const PreferenceContext = createContext<PreferenceState | undefined>(undefined)

interface PreferenceProviderProps {
    children: JSX.Element
}

export const PreferenceProvider = (props: PreferenceProviderProps): JSX.Element => {
    const api = useApi()

    const [initialized, setInitialized] = useState<boolean>(false)

    const [themeName, setThemeName] = usePersistent<string>('themeName', 'basic')
    const [imgurClientID, setImgurClientID] = usePersistent<string>('imgurClientID', '')
    const [followingUsers, setFollowingUsers] = usePersistent<string[]>('followingUsers', [])
    const [followingStreams, setFollowingStreams] = usePersistent<string[]>('followingStreams', [])
    const [bookmarkingStreams, setBookmarkingStreams] = usePersistent<string[]>('bookmarkingStreams', [])
    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>('defaultPostNonHome', [])
    const [devMode, setDevMode] = usePersistent<boolean>('devMode', false)
    const [showEditorOnTop, setShowEditorOnTop] = usePersistent<boolean>('showEditorOnTop', false)
    const [showEditorOnTopMobile, setShowEditorOnTopMobile] = usePersistent<boolean>('showEditorOnTopMobile', false)

    const followUser = useCallback(
        (ccaddr: string): void => {
            if (followingUsers.includes(ccaddr)) return
            setFollowingUsers([...followingUsers, ccaddr])
        },
        [followingUsers, setFollowingUsers]
    )

    const unfollowUser = useCallback(
        (ccaddr: string): void => {
            setFollowingUsers(followingUsers.filter((e: string) => e !== ccaddr))
        },
        [followingUsers, setFollowingUsers]
    )

    const followStream = useCallback(
        (streamID: string): void => {
            if (followingStreams.includes(streamID)) return
            setFollowingStreams([...followingStreams, streamID])
        },
        [followingStreams, setFollowingStreams]
    )

    const unfollowStream = useCallback(
        (streamID: string): void => {
            setFollowingStreams(followingStreams.filter((e: string) => e !== streamID))
        },
        [followingStreams, setFollowingStreams]
    )

    const bookmarkStream = useCallback(
        (streamID: string): void => {
            if (bookmarkingStreams.includes(streamID)) return
            setBookmarkingStreams([...bookmarkingStreams, streamID])
        },
        [bookmarkingStreams, setBookmarkingStreams]
    )

    const unbookmarkStream = useCallback(
        (streamID: string): void => {
            setBookmarkingStreams(bookmarkingStreams.filter((e: string) => e !== streamID))
        },
        [bookmarkingStreams, setBookmarkingStreams]
    )

    useEffect(() => {
        if (!api) return
        if (initialized) return
        api.readKV('world.concurrent.preference')
            .then((storage: string | undefined) => {
                setInitialized(true)
                if (!storage) return
                const parsed = JSON.parse(storage)
                setThemeName(parsed.themeName)
                setImgurClientID(parsed.imgurClientID)
                setFollowingUsers(parsed.followingUsers)
                setFollowingStreams(parsed.followingStreams)
                setBookmarkingStreams(parsed.bookmarkingStreams)
                setDefaultPostHome(parsed.defaultPostHome)
                setDefaultPostNonHome(parsed.defaultPostNonHome)
                setDevMode(parsed.devMode)
                setShowEditorOnTop(parsed.showEditorOnTop)
                setShowEditorOnTopMobile(parsed.showEditorOnTopMobile)
            })
            .catch((e) => {
                setInitialized(true)
                console.log(e)
            })
    }, [])

    useEffect(() => {
        if (!api) return
        if (!initialized) return
        const storage = JSON.stringify({
            themeName,
            imgurClientID,
            followingUsers,
            followingStreams,
            bookmarkingStreams,
            defaultPostHome,
            defaultPostNonHome,
            devMode,
            showEditorOnTop,
            showEditorOnTopMobile
        })
        api.writeKV('world.concurrent.preference', storage)
    }, [
        themeName,
        imgurClientID,
        followingUsers,
        followingStreams,
        bookmarkingStreams,
        defaultPostHome,
        defaultPostNonHome,
        devMode,
        showEditorOnTop,
        showEditorOnTopMobile
    ])

    const value = useMemo(() => {
        return {
            themeName,
            setThemeName,
            imgurClientID,
            setImgurClientID,
            followingUsers,
            followUser,
            unfollowUser,
            followingStreams,
            setFollowingStreams,
            followStream,
            unfollowStream,
            bookmarkingStreams,
            bookmarkStream,
            unbookmarkStream,
            defaultPostHome,
            setDefaultPostHome,
            defaultPostNonHome,
            setDefaultPostNonHome,
            devMode,
            setDevMode,
            showEditorOnTop,
            setShowEditorOnTop,
            showEditorOnTopMobile,
            setShowEditorOnTopMobile
        }
    }, [
        themeName,
        setThemeName,
        imgurClientID,
        setImgurClientID,
        followingUsers,
        followUser,
        unfollowUser,
        followingStreams,
        setFollowingStreams,
        followStream,
        unfollowStream,
        bookmarkingStreams,
        bookmarkStream,
        unbookmarkStream,
        defaultPostHome,
        setDefaultPostHome,
        defaultPostNonHome,
        setDefaultPostNonHome,
        devMode,
        setDevMode,
        showEditorOnTop,
        setShowEditorOnTop,
        showEditorOnTopMobile,
        setShowEditorOnTopMobile
    ])

    return <PreferenceContext.Provider value={value}>{props.children}</PreferenceContext.Provider>
}

export function usePreference(): PreferenceState {
    return useContext(PreferenceContext) as PreferenceState
}
