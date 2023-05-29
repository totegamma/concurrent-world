import { useEffect, useState, createContext, useRef, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, Drawer } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'

import { Schemas } from './schemas'
import { Themes, createConcurrentTheme } from './themes'
import { Menu } from './components/Menu'
import type { StreamElementDated, ServerEvent, Emoji, ConcurrentTheme, ImgurSettings, Character, Host } from './model'
import { Associations, Explorer, Notifications, Identity, Settings, TimelinePage } from './pages'

import Sound from './resources/Bubble.wav'
import useSound from 'use-sound'
import { MobileMenu } from './components/MobileMenu'
import { StreamInfo } from './pages/StreamInfo'
import ApiProvider from './context/api'
import ConcurrentApiClient from './apiservice'
import { FollowProvider } from './context/FollowContext'
import type { Profile } from './schemas/profile'
import type { Userstreams } from './schemas/userstreams'

export const ApplicationContext = createContext<appData>({
    profile: undefined,
    userstreams: undefined,
    emojiDict: {},
    websocketState: -1,
    imgurSettings: {
        clientId: '',
        clientSecret: ''
    },
    setImgurSettings: (_: ImgurSettings) => {}
})

export interface appData {
    profile: Character<Profile> | undefined
    userstreams: Character<Userstreams> | undefined
    emojiDict: Record<string, Emoji>
    websocketState: ReadyState
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

    const [themeName, setThemeName] = usePersistent<string>('Theme', Object.keys(Themes)[0])

    const [imgurSettings, setImgurSettings] = usePersistent<ImgurSettings>('imgurSettings', {
        clientId: '',
        clientSecret: ''
    })
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const messages = useObjectList<StreamElementDated>()
    const [currentStreams, setCurrentStreams] = useState<string[]>([])

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    const { lastMessage, readyState, sendJsonMessage } = useWebSocket(`wss://${host.fqdn}/api/v1/socket`, {
        shouldReconnect: (_) => true,
        reconnectInterval: (attempt) => Math.min(Math.pow(2, attempt) * 1000, 10000)
    })

    const [playNotification] = useSound(Sound)
    const playNotificationRef = useRef(playNotification)
    const [profile, setProfile] = useState<Character<Profile>>()
    const [userstreams, setUserstreams] = useState<Character<Userstreams>>()
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
        fetch('https://gist.githubusercontent.com/totegamma/0beb41acad70aa4945ad38a6b00a3a1d/raw/emojis.json') // FIXME temporaly hardcoded
            .then((j) => j.json())
            .then((data) => {
                const dict = Object.fromEntries(data.emojis.map((e: any) => [e.emoji.name, e.emoji]))
                setEmojiDict(dict)
            })
    }, [])

    useEffect(() => {
        api?.readCharacter(address, Schemas.profile).then((profile) => {
            setProfile(profile)
        })
        api?.readCharacter(address, Schemas.userstreams).then((userstreams) => {
            setUserstreams(userstreams)
        })
    }, [address, api])

    useEffect(() => {
        sendJsonMessage({ channels: currentStreams })
    }, [currentStreams])

    useEffect(() => {
        if (!lastMessage) return
        const event: ServerEvent = JSON.parse(lastMessage.data)
        if (!event) return
        switch (event.type) {
            case 'message': {
                switch (event.action) {
                    case 'create': {
                        if (messages.current.find((e) => e.id === event.body.id) != null) {
                            return
                        }
                        const current = new Date().getTime()
                        messages.pushFront({
                            ...event.body,
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
                switch (event.action) {
                    case 'create': {
                        api?.invalidateMessage(event.body.id)
                        const target = messages.current.find((e) => e.id === event.body.id)
                        if (target) {
                            target.LastUpdated = new Date().getTime()
                            messages.update((e) => [...e])
                        }
                        break
                    }
                    case 'delete': {
                        api?.invalidateMessage(event.body.id)
                        const target = messages.current.find((e) => e.id === event.body.id)
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
        let themeColorMetaTag: HTMLMetaElement = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
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
            userstreams,
            websocketState: readyState,
            imgurSettings,
            setImgurSettings
        }
    }, [emojiDict, profile, userstreams, readyState, imgurSettings, setImgurSettings])

    if (!api) {
        return <>building api service...</>
    }

    return (
        <ThemeProvider theme={theme}>
            <ClockContext.Provider value={clock}>
                <ApiProvider api={api}>
                    <FollowProvider>
                        <ApplicationContext.Provider value={applicationContext}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    background: [
                                        theme.palette.background.default,
                                        `linear-gradient(${theme.palette.background.default}, ${darken(
                                            theme.palette.background.default,
                                            0.1
                                        )})`
                                    ],
                                    width: '100vw',
                                    height: '100dvh'
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flex: 1,
                                        maxWidth: '1280px',
                                        width: '100%'
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
                                        <Menu />
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
                                                margin: {
                                                    xs: '4px',
                                                    sm: '10px'
                                                },
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
                                                        <TimelinePage
                                                            messages={messages}
                                                            currentStreams={currentStreams}
                                                            setCurrentStreams={setCurrentStreams}
                                                            setMobileMenuOpen={setMobileMenuOpen}
                                                        />
                                                    }
                                                />
                                                <Route path="/associations" element={<Associations />} />
                                                <Route path="/explorer" element={<Explorer />} />
                                                <Route path="/notifications" element={<Notifications />} />
                                                <Route path="/identity" element={<Identity />} />
                                                <Route
                                                    path="/settings"
                                                    element={<Settings setThemeName={setThemeName} />}
                                                />
                                                <Route path="/streaminfo" element={<StreamInfo />} />
                                            </Routes>
                                        </Paper>
                                        <Box
                                            sx={{
                                                display: {
                                                    xs: 'block',
                                                    sm: 'none'
                                                }
                                            }}
                                        >
                                            <MobileMenu />
                                        </Box>
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
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                    }}
                                    hideMenu
                                />
                            </Drawer>
                        </ApplicationContext.Provider>
                    </FollowProvider>
                </ApiProvider>
            </ClockContext.Provider>
        </ThemeProvider>
    )
}

export default App
