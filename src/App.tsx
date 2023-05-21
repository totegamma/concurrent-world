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
    Stream,
    ConcurrentTheme,
    ImgurSettings
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

export const ApplicationContext = createContext<appData>({
    serverAddress: '',
    publickey: '',
    privatekey: '',
    userAddress: '',
    profile: {
        username: '',
        avatar: '',
        description: '',
        homeStream: '',
        notificationStream: ''
    },
    emojiDict: {},
    streamDict: dummyResourceManager,
    userDict: dummyResourceManager,
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
    serverAddress: string
    publickey: string
    privatekey: string
    userAddress: string
    profile: Profile
    emojiDict: Record<string, Emoji>
    streamDict: IuseResourceManager<Stream>
    userDict: IuseResourceManager<Profile>
    messageDict: IuseResourceManager<Message>
    websocketState: ReadyState
    watchStreams: string[]
    imgurSettings: ImgurSettings
    setImgurSettings: (settings: ImgurSettings) => void
}

export const ClockContext = createContext<Date>(new Date())

function App(): JSX.Element {
    const [server, setServer] = usePersistent<string>('ServerAddress', '')
    const [pubkey, setPubKey] = usePersistent<string>('PublicKey', '')
    const [prvkey, setPrvKey] = usePersistent<string>('PrivateKey', '')
    const [address, setAddress] = usePersistent<string>('Address', '')
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
        server.replace('http', 'ws') + 'socket',
        {
            shouldReconnect: (_) => true,
            reconnectInterval: (attempt) =>
                Math.min(Math.pow(2, attempt) * 1000, 10000)
        }
    )

    const [playNotification] = useSound(Sound)
    const playNotificationRef = useRef(playNotification)
    const [profile, setProfile] = useState<Profile>({
        username: 'anonymous',
        avatar: '',
        description: '',
        homeStream: '',
        notificationStream: ''
    })
    const profileRef = useRef<Profile>(profile)
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

    const userDict = useResourceManager<Profile>(
        useCallback(
            async (key: string): Promise<Profile> => {
                const res = await fetch(
                    server +
                        'characters?author=' +
                        encodeURIComponent(key) +
                        '&schema=' +
                        encodeURIComponent(Schemas.profile),
                    {
                        method: 'GET',
                        headers: {}
                    }
                )
                const data = await res.json()
                if (data.characters.length === 0) {
                    return {}
                }
                const payload = JSON.parse(data.characters[0].payload)
                return payload
            },
            [server]
        )
    )

    const messageDict = useResourceManager<Message>(
        useCallback(
            async (key: string) => {
                const res = await fetch(server + `messages/${key}`, {
                    method: 'GET',
                    headers: {}
                })
                const data = await res.json()
                return data.message
            },
            [server]
        )
    )

    const streamDict = useResourceManager<Stream>(async (key: string) => {
        const res = await fetch(server + `stream?stream=${key}`, {
            method: 'GET',
            headers: {}
        })
        const data = await res.json()
        return data
    })

    const follow = useCallback(
        (ccaddress: string): void => {
            if (followList.includes(ccaddress)) return
            setFollowList([...followList, ccaddress])
        },
        [followList, setFollowList]
    )

    useEffect(() => {
        userDict.get(address).then((profile) => {
            setProfile(profile)
            profileRef.current = profile
        })
    }, [address])

    useEffect(() => {
        if (!lastMessage) return
        const event: ServerEvent = JSON.parse(lastMessage.data)
        if (!event) return
        switch (event.type) {
            case 'message': {
                const message = event.body as Message
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
                        const groupB = message.streams.split(',')
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

    return (
        <ThemeProvider theme={theme}>
            <ClockContext.Provider value={clock}>
                <ApplicationContext.Provider
                    value={useMemo(() => {
                        return {
                            serverAddress: server,
                            publickey: pubkey,
                            privatekey: prvkey,
                            userAddress: address,
                            emojiDict,
                            profile,
                            streamDict,
                            userDict,
                            messageDict,
                            websocketState: readyState,
                            watchStreams,
                            imgurSettings,
                            setImgurSettings
                        }
                    }, [
                        server,
                        pubkey,
                        address,
                        emojiDict,
                        profile,
                        streamDict,
                        userDict,
                        messageDict,
                        readyState,
                        watchStreams,
                        imgurSettings,
                        setImgurSettings
                    ])}
                >
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
                                    borderRadius: { xs: '15px', md: '20px' },
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
                                                setWatchList={setWatchStreams}
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
                                                setPrvKey={setPrvKey}
                                                setPubKey={setPubKey}
                                                setUserAddr={setAddress}
                                                setServerAddr={setServer}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/streaminfo"
                                        element={
                                            <StreamInfo
                                                followList={followList}
                                                setFollowList={setFollowList}
                                            />
                                        }
                                    />
                                </Routes>
                            </Paper>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
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
            </ClockContext.Provider>
        </ThemeProvider>
    )
}

export default App
