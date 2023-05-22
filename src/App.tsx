import {
    useEffect,
    useState,
    useCallback,
    createContext,
    useRef,
    useMemo
} from 'react'
import { Routes, Route } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, Drawer } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'
import {
    useResourceManager,
    dummyResourceManager,
    type IuseResourceManager
} from './hooks/useResourceManager'

import { Schemas } from './schemas'
import { Themes, createConcurrentTheme } from './themes'
import { Menu } from './components/Menu'
import type {
    Message,
    StreamElementDated,
    ServerEvent,
    Association,
    Emoji,
    ConcurrentTheme,
    ImgurSettings,
    Character,
    Host
} from './model'
import {
    Associations,
    Explorer,
    Notifications,
    Identity,
    Settings,
    Timeline
} from './pages'

import type { Profile } from './schemas/profile'

import Sound from './resources/Bubble.wav'
import useSound from 'use-sound'
import { MobileMenu } from './components/MobileMenu'
import { StreamInfo } from './pages/StreamInfo'
import ApiProvider from './context/api'
import ConcurrentApiClient from './apiservice'

export const ApplicationContext = createContext<appData>({
    profile: undefined,
    emojiDict: {},
    messageDict: dummyResourceManager,
    websocketState: -1,
    watchStreams: [],
    imgurSettings: {
        clientId: '',
        clientSecret: ''
    },
    setImgurSettings: (settings: ImgurSettings) => {}
})

export interface appData {
    profile: Character<Profile> | undefined
    emojiDict: Record<string, Emoji>
    messageDict: IuseResourceManager<Message<any>>
    websocketState: ReadyState
    watchStreams: string[]
    imgurSettings: ImgurSettings
    setImgurSettings: (settings: ImgurSettings) => void
}

export const ClockContext = createContext<Date>(new Date())

function App(): JSX.Element {
    const [host] = usePersistent<Host>('Host', null as any)
    const [prvkey] = usePersistent<string>('PrivateKey', '')
    const [address] = usePersistent<string>('Address', '')
    const [api, initializeApi] = useState<ConcurrentApiClient>()
    useEffect(() => {
        const api = new ConcurrentApiClient(address, prvkey, host)
        initializeApi(api)
    }, [host, address, prvkey])

    const [followList, setFollowList] = usePersistent<string[]>(
        'followList',
        []
    )
    const [themeName, setThemeName] = usePersistent<string>(
        'Theme',
        Object.keys(Themes)[0]
    )
    const [watchStreams, setWatchStreams] = usePersistent<string[]>(
        'watchStreamList',
        []
    )
    const [imgurSettings, setImgurSettings] = usePersistent<ImgurSettings>(
        'imgurSettings',
        {
            clientId: '',
            clientSecret: ''
        }
    )
    const [theme, setTheme] = useState<ConcurrentTheme>(
        createConcurrentTheme(themeName)
    )
    const messages = useObjectList<StreamElementDated>()
    const [currentStreams, setCurrentStreams] = useState<string[]>([])

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    const { lastMessage, readyState } = useWebSocket(
        `wss://${host.fqdn}/api/v1/socket`,
        {
            shouldReconnect: (_) => true,
            reconnectInterval: (attempt) =>
                Math.min(Math.pow(2, attempt) * 1000, 10000)
        }
    )

    const [playNotification] = useSound(Sound)
    const playNotificationRef = useRef(playNotification)
    const [profile, setProfile] = useState<Character<Profile>>()
    useEffect(() => {
        playNotificationRef.current = playNotification
    }, [playNotification])

    const [clock, setClock] = useState<Date>(new Date())
    useEffect(() => {
        const timer = setInterval(() => {
            setClock(new Date())
        }, 5000)
        return () => {
            clearInterval(timer)
        }
    }, [setClock])

    const [emojiDict, setEmojiDict] = useState<Record<string, Emoji>>({})
    useEffect(() => {
        fetch(
            'https://gist.githubusercontent.com/totegamma/0beb41acad70aa4945ad38a6b00a3a1d/raw/emojis.json'
        ) // FIXME temporaly hardcoded
            .then((j) => j.json())
            .then((data) => {
                const dict = Object.fromEntries(
                    data.emojis.map((e: any) => [e.emoji.name, e.emoji])
                )
                setEmojiDict(dict)
            })
    }, [])

    const messageDict = useResourceManager<Message<any>>(
        useCallback(
            async (key: string) => {
                const res = await fetch(
                    `https://${host.fqdn}/api/v1/messages/${key}`,
                    {
                        method: 'GET',
                        headers: {}
                    }
                )
                const data = await res.json()
                return {
                    ...data,
                    payload: JSON.parse(data.payload ?? 'null')
                }
            },
            [host]
        )
    )

    const follow = useCallback(
        (ccaddress: string): void => {
            if (followList.includes(ccaddress)) return
            setFollowList([...followList, ccaddress])
        },
        [followList, setFollowList]
    )

    useEffect(() => {
        api?.readCharacter(address, Schemas.profile).then((profile) => {
            setProfile(profile)
        })
    }, [address, api])

    useEffect(() => {
        if (!lastMessage) return
        const event: ServerEvent = JSON.parse(lastMessage.data)
        if (!event) return
        switch (event.type) {
            case 'message': {
                const message = event.body as Message<any>
                switch (event.action) {
                    case 'create': {
                        if (
                            messages.current.find(
                                (e) => e.Values.id === message.id
                            ) != null
                        ) {
                            return
                        }
                        const groupA = currentStreams
                        const groupB = message.streams
                        if (!groupA.some((e) => groupB.includes(e))) return
                        const current = new Date().getTime()
                        messages.pushFront({
                            ID: new Date(message.cdate)
                                .getTime()
                                .toString()
                                .replace('.', '-'),
                            Values: {
                                id: message.id
                            },
                            LastUpdated: current
                        })
                        playNotificationRef.current()
                        break
                    }
                    default:
                        console.log('unknown message action', event)
                        break
                }
                break
            }
            case 'association': {
                const association = event.body as Association
                console.log(event)
                switch (event.action) {
                    case 'create': {
                        messageDict.invalidate(association.targetID)
                        const target = messages.current.find(
                            (e) => e.Values.id === association.targetID
                        )
                        if (target) {
                            target.LastUpdated = new Date().getTime()
                            messages.update((e) => [...e])
                        }
                        break
                    }
                    case 'delete': {
                        messageDict.invalidate(association.targetID)
                        const target = messages.current.find(
                            (e) => e.Values.id === association.targetID
                        )
                        if (target) {
                            target.LastUpdated = new Date().getTime()
                            messages.update((e) => [...e])
                        }
                        break
                    }
                    default:
                        console.log('unknown message action', event)
                        break
                }
                break
            }
            default:
                console.log('unknown event', event)
                break
        }
    }, [lastMessage])

    useEffect(() => {
        const newtheme = createConcurrentTheme(themeName)
        setTheme(newtheme)
        let themeColorMetaTag: HTMLMetaElement = document.querySelector(
            'meta[name="theme-color"]'
        ) as HTMLMetaElement
        if (!themeColorMetaTag) {
            themeColorMetaTag = document.createElement('meta')
            themeColorMetaTag.name = 'theme-color'
            document.head.appendChild(themeColorMetaTag)
        }
        themeColorMetaTag.content = newtheme.palette.background.default
    }, [themeName])

    const applicationContext = useMemo(() => {
        return {
            emojiDict,
            profile,
            messageDict,
            websocketState: readyState,
            watchStreams,
            imgurSettings,
            setImgurSettings
        }
    }, [
        emojiDict,
        profile,
        messageDict,
        readyState,
        watchStreams,
        imgurSettings,
        setImgurSettings
    ])

    if (!api) {
        return <>building api service...</>
    }

    return (
        <ThemeProvider theme={theme}>
            <ClockContext.Provider value={clock}>
                <ApiProvider api={api}>
                    <ApplicationContext.Provider value={applicationContext}>
                        <Box
                            sx={{
                                display: 'flex',
                                maxWidth: '1280px',
                                margin: 'auto',
                                background: [
                                    theme.palette.background.default,
                                    `linear-gradient(${
                                        theme.palette.background.default
                                    }, ${darken(
                                        theme.palette.background.default,
                                        0.1
                                    )})`
                                ],
                                height: '100dvh'
                            }}
                        >
                            <Box
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'block',
                                        width: '200px'
                                    }
                                }}
                            >
                                <Menu streams={watchStreams} />
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    overflow: 'hidden',
                                    flex: 1
                                }}
                            >
                                <Paper
                                    sx={{
                                        flexGrow: '1',
                                        margin: { xs: '4px', sm: '10px' },
                                        mb: { xs: 0, sm: '10px' },
                                        display: 'flex',
                                        flexFlow: 'column',
                                        borderRadius: {
                                            xs: '15px',
                                            md: '20px'
                                        },
                                        overflow: 'hidden',
                                        background: 'none'
                                    }}
                                >
                                    <Routes>
                                        <Route
                                            index
                                            element={
                                                <Timeline
                                                    messages={messages}
                                                    follow={follow}
                                                    followList={followList}
                                                    setCurrentStreams={
                                                        setCurrentStreams
                                                    }
                                                    setMobileMenuOpen={
                                                        setMobileMenuOpen
                                                    }
                                                />
                                            }
                                        />
                                        <Route
                                            path="/associations"
                                            element={<Associations />}
                                        />
                                        <Route
                                            path="/explorer"
                                            element={
                                                <Explorer
                                                    watchList={watchStreams}
                                                    setWatchList={
                                                        setWatchStreams
                                                    }
                                                />
                                            }
                                        />
                                        <Route
                                            path="/notifications"
                                            element={<Notifications />}
                                        />
                                        <Route
                                            path="/identity"
                                            element={<Identity />}
                                        />
                                        <Route
                                            path="/settings"
                                            element={
                                                <Settings
                                                    setThemeName={setThemeName}
                                                />
                                            }
                                        />
                                        <Route
                                            path="/streaminfo"
                                            element={
                                                <StreamInfo
                                                    followList={followList}
                                                    setFollowList={
                                                        setFollowList
                                                    }
                                                />
                                            }
                                        />
                                    </Routes>
                                </Paper>
                                <Box
                                    sx={{
                                        display: { xs: 'block', sm: 'none' }
                                    }}
                                >
                                    <MobileMenu />
                                </Box>
                            </Box>
                        </Box>
                        <Drawer
                            anchor={'left'}
                            open={mobileMenuOpen}
                            onClose={() => {
                                setMobileMenuOpen(false)
                            }}
                            PaperProps={{
                                sx: {
                                    width: '200px',
                                    padding: '0 5px 0 0',
                                    borderRadius: '0 20px 20px 0',
                                    overflow: 'hidden',
                                    backgroundColor: 'background.default'
                                }
                            }}
                        >
                            <Menu
                                streams={watchStreams}
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                }}
                                hideMenu
                            />
                        </Drawer>
                    </ApplicationContext.Provider>
                </ApiProvider>
            </ClockContext.Provider>
        </ThemeProvider>
    )
}

export default App
