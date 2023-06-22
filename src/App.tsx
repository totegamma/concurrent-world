import { useEffect, useState, createContext, useRef, useMemo } from 'react'
import { DndProvider, getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview'
import { Routes, Route, useLocation } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, SwipeableDrawer } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'

import { Schemas } from './schemas'
import { Themes, createConcurrentTheme } from './themes'
import { Menu } from './components/Menu'
import type { StreamElementDated, ServerEvent, Emoji, ConcurrentTheme, ImgurSettings, Character, Host } from './model'
import {
    Associations,
    Explorer,
    Notifications,
    Identity,
    Settings,
    TimelinePage,
    EntityPage,
    MessagePage,
    Devtool
} from './pages'

import BubbleSound from './resources/Bubble.wav'
import NotificationSound from './resources/Notification.wav'
import useSound from 'use-sound'
import { MobileMenu } from './components/MobileMenu'
import ApiProvider from './context/api'
import ConcurrentApiClient from './apiservice'
import { FollowProvider } from './context/FollowContext'
import type { Profile } from './schemas/profile'
import type { Userstreams } from './schemas/userstreams'

const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

export const ApplicationContext = createContext<appData>({
    profile: undefined,
    userstreams: undefined,
    emojiDict: {},
    websocketState: -1,
    imgurSettings: {
        clientId: ''
    },
    setImgurSettings: (_: ImgurSettings) => {},
    displayingStream: []
})

export interface appData {
    profile: Character<Profile> | undefined
    userstreams: Character<Userstreams> | undefined
    emojiDict: Record<string, Emoji>
    websocketState: ReadyState
    imgurSettings: ImgurSettings
    setImgurSettings: (settings: ImgurSettings) => void
    displayingStream: string[]
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
        clientId: ''
    })
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const messages = useObjectList<StreamElementDated>()
    const [userstreams, setUserstreams] = useState<Character<Userstreams>>()

    const [followingUserStreams, setFollowingUserStreams] = useState<string[]>([])
    useEffect(() => {
        const followingUsers = JSON.parse(localStorage.getItem('followingUsers') ?? '[]')
        api?.getUserHomeStreams(followingUsers).then((streams) => {
            setFollowingUserStreams(streams)
        })
    }, [api])

    const path = useLocation()
    const displayingStream: string[] = useMemo(() => {
        switch (path.pathname) {
            case '/': {
                const query = path.hash.replace('#', '').split(',')
                if (query.length === 0 || query[0] === '') {
                    // is Home
                    const followingStreams = JSON.parse(localStorage.getItem('followingStreams') ?? '[]')
                    return [...followingStreams, ...followingUserStreams].filter((e) => e)
                }
                return query
            }
            case '/notifications': {
                const notifications = userstreams?.payload.body.notificationStream
                if (!notifications) return []
                return [notifications]
            }
            case '/associations': {
                const associations = userstreams?.payload.body.associationStream
                if (!associations) return []
                return [associations]
            }
            default: {
                return []
            }
        }
    }, [path, userstreams, followingUserStreams])

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    const { lastMessage, readyState, sendJsonMessage } = useWebSocket(`wss://${host.fqdn}/api/v1/socket`, {
        shouldReconnect: (_) => true,
        reconnectInterval: (attempt) => Math.min(Math.pow(2, attempt) * 1000, 10000),
        onOpen: (_) => {
            sendJsonMessage({ channels: displayingStream })
        }
    })

    const [playBubble] = useSound(BubbleSound)
    const [playNotification] = useSound(NotificationSound, { volume: 0.3 })
    const playBubbleRef = useRef(playBubble)
    const playNotificationRef = useRef(playNotification)
    const [profile, setProfile] = useState<Character<Profile>>()
    useEffect(() => {
        playBubbleRef.current = playBubble
        playNotificationRef.current = playNotification
    }, [playBubble, playNotification])

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
        sendJsonMessage({
            channels: [
                ...displayingStream,
                ...(userstreams?.payload.body.notificationStream ? [userstreams.payload.body.notificationStream] : [])
            ]
        })
    }, [displayingStream, userstreams])

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
                        messages.pushFront(
                            {
                                ...event.body,
                                LastUpdated: current
                            },
                            (lhs: StreamElementDated[], rhs: StreamElementDated) =>
                                lhs.find((e: StreamElementDated) => e.id === rhs.id) == null
                        )
                        playBubbleRef.current()
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
                        if (event.stream === userstreams?.payload.body.notificationStream) {
                            playNotificationRef.current()
                            api?.fetchAssociation(event.body.id, event.body.currenthost).then((a) => {
                                if (!a) return
                                if (a.schema === Schemas.replyAssociation) {
                                    api?.readCharacter(a.author, Schemas.profile).then(
                                        (c: Character<Profile> | undefined) => {
                                            enqueueSnackbar(
                                                `${c?.payload.body.username ?? 'anonymous'} replied to your message.`
                                            )
                                        }
                                    )
                                    return
                                }

                                if (a.schema === Schemas.reRouteAssociation) {
                                    api?.readCharacter(a.author, Schemas.profile).then(
                                        (c: Character<Profile> | undefined) => {
                                            enqueueSnackbar(
                                                `${c?.payload.body.username ?? 'anonymous'} rerouted to your message.`
                                            )
                                        }
                                    )
                                    return
                                }

                                if (a.schema === Schemas.like) {
                                    api.fetchMessage(a.targetID).then((m) => {
                                        m &&
                                            api
                                                .readCharacter(a.author, Schemas.profile)
                                                .then((c: Character<Profile> | undefined) => {
                                                    enqueueSnackbar(
                                                        `${c?.payload.body.username ?? 'anonymous'} favorited "${
                                                            (m.payload.body.body as string) ?? 'your message.'
                                                        }"`
                                                    )
                                                })
                                    })
                                    return
                                }

                                enqueueSnackbar('unknown association received.')
                            })
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
            setImgurSettings,
            displayingStream
        }
    }, [emojiDict, profile, userstreams, readyState, imgurSettings, setImgurSettings, displayingStream])

    if (!api) {
        return <>building api service...</>
    }

    const providers = (childs: JSX.Element): JSX.Element => (
        <SnackbarProvider preventDuplicate>
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                <ThemeProvider theme={theme}>
                    <ClockContext.Provider value={clock}>
                        <ApiProvider api={api}>
                            <FollowProvider>
                                <ApplicationContext.Provider value={applicationContext}>
                                    {childs}
                                </ApplicationContext.Provider>
                            </FollowProvider>
                        </ApiProvider>
                    </ClockContext.Provider>
                </ThemeProvider>
            </DndProvider>
        </SnackbarProvider>
    )

    return providers(
        <>
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
                                    element={<TimelinePage messages={messages} setMobileMenuOpen={setMobileMenuOpen} />}
                                />
                                <Route path="/associations" element={<Associations messages={messages} />} />
                                <Route path="/explorer" element={<Explorer />} />
                                <Route path="/notifications" element={<Notifications messages={messages} />} />
                                <Route path="/identity" element={<Identity />} />
                                <Route path="/settings" element={<Settings setThemeName={setThemeName} />} />
                                <Route path="/message/:id" element={<MessagePage />} />
                                <Route path="/entity/:id" element={<EntityPage />} />
                                <Route path="/devtool" element={<Devtool />} />
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
            <SwipeableDrawer
                anchor={'left'}
                open={mobileMenuOpen}
                onOpen={() => {
                    setMobileMenuOpen(true)
                }}
                onClose={() => {
                    setMobileMenuOpen(false)
                }}
                disableBackdropTransition={!iOS}
                disableDiscovery={iOS}
                disableSwipeToOpen={false}
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
            </SwipeableDrawer>
        </>
    )
}

export default App
