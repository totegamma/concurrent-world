import { useEffect, useState, createContext, useRef, useMemo } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, CssBaseline } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'

import { Client, Schemas, type CoreServerEvent } from '@concurrent-world/client'
import { Themes, createConcurrentTheme } from './themes'
import { Menu } from './components/Menu/Menu'
import type { StreamElementDated, Emoji, ConcurrentTheme, StreamList } from './model'
import {
    Associations,
    Explorer,
    Notifications,
    Settings,
    StreamPage,
    EntityPage,
    MessagePage,
    ListPage,
    Devtool
} from './pages'

import BubbleSound from './resources/Bubble.wav'
import NotificationSound from './resources/Notification.wav'
import useSound from 'use-sound'
import { MobileMenu } from './components/Menu/MobileMenu'
import ApiProvider from './context/api'
import { PreferenceProvider } from './context/PreferenceContext'
import { GlobalActionsProvider } from './context/GlobalActions'
import { EmojiPickerProvider } from './context/EmojiPickerContext'

// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
const branchName = branch || window.location.host.split('.')[0]
const versionString = `${location.hostname}-${branchName as string}-${sha.slice(0, 7) as string}`

export const ApplicationContext = createContext<appData>({
    emojiDict: {},
    websocketState: -1,
    displayingStream: [],
    setThemeName: (_newtheme: string) => {}
})

export interface appData {
    emojiDict: Record<string, Emoji>
    websocketState: ReadyState
    displayingStream: string[]
    setThemeName: (newtheme: string) => void
}

export const ClockContext = createContext<Date>(new Date())

function App(): JSX.Element {
    const [domain] = usePersistent<string>('Domain', '')
    const [prvkey] = usePersistent<string>('PrivateKey', '')
    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        try {
            const client = new Client(prvkey, domain, versionString)
            initializeClient(client)
        } catch (e) {
            console.log(e)
        }
    }, [domain, prvkey])

    const [themeName, setThemeName] = usePersistent<string>('Theme', Object.keys(Themes)[0])

    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const messages = useObjectList<StreamElementDated>()

    const [followingUserStreams, setFollowingUserStreams] = useState<string[]>([])
    useEffect(() => {
        const followingUsers = JSON.parse(localStorage.getItem('followingUsers') ?? '[]')
        client?.getUserHomeStreams(followingUsers).then((streams) => {
            setFollowingUserStreams(streams)
        })
    }, [client])

    const listsSource = localStorage.getItem('lists')
    const lists: Record<string, StreamList> = listsSource ? JSON.parse(listsSource) : {}

    const path = useLocation()
    const displayingStream: string[] = useMemo(() => {
        switch (path.pathname) {
            case '/': {
                const rawid = path.hash.replace('#', '')
                const list = lists[rawid] ?? Object.values(lists)[0]
                if (!list) return []
                console.log(list)
                return [...list.streams, list.userStreams.map((e) => e.streamID)].flat()
            }
            case '/stream': {
                return path.hash.replace('#', '').split(',')
            }
            case '/notifications': {
                const notifications = client?.user?.userstreams?.notificationStream
                if (!notifications) return []
                return [notifications]
            }
            case '/associations': {
                const associations = client?.user?.userstreams?.associationStream
                if (!associations) return []
                return [associations]
            }
            default: {
                return []
            }
        }
    }, [client, path, followingUserStreams])

    const { lastMessage, readyState, sendJsonMessage } = useWebSocket(`wss://${domain}/api/v1/socket`, {
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
        sendJsonMessage({
            channels: [
                ...displayingStream,
                ...(client?.user?.userstreams?.notificationStream ? [client?.user?.userstreams.notificationStream] : [])
            ]
        })
    }, [displayingStream, client])

    useEffect(() => {
        if (!lastMessage) return
        const event: CoreServerEvent = JSON.parse(lastMessage.data)
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
                        client?.api.invalidateMessage(event.body.id)
                        const target = messages.current.find((e) => e.id === event.body.id)
                        if (target) {
                            target.LastUpdated = new Date().getTime()
                            messages.update((e) => [...e])
                        }
                        if (event.stream === client?.user?.userstreams?.notificationStream) {
                            playNotificationRef.current()
                            client?.api.readAssociation(event.body.id, event.body.currenthost).then((a) => {
                                if (!a) return
                                if (a.schema === Schemas.replyAssociation) {
                                    client?.api.readCharacter(a.author, Schemas.profile).then((c) => {
                                        enqueueSnackbar(
                                            `${c?.payload.body.username ?? 'anonymous'} replied to your message.`
                                        )
                                    })
                                    return
                                }

                                if (a.schema === Schemas.rerouteAssociation) {
                                    client?.api.readCharacter(a.author, Schemas.profile).then((c) => {
                                        enqueueSnackbar(
                                            `${c?.payload.body.username ?? 'anonymous'} rerouted to your message.`
                                        )
                                    })
                                    return
                                }

                                if (a.schema === Schemas.like) {
                                    client?.api.readMessage(a.targetID).then((m) => {
                                        m &&
                                            client.api.readCharacter(a.author, Schemas.profile).then((c) => {
                                                enqueueSnackbar(
                                                    `${c?.payload.body.username ?? 'anonymous'} favorited "${
                                                        (m.payload.body.body as string) ?? 'your message.'
                                                    }"`
                                                )
                                            })
                                    })
                                    return
                                }

                                if (a.schema === Schemas.emojiAssociation) {
                                    client.api.readMessage(a.targetID).then((m) => {
                                        console.log(m)
                                        m &&
                                            client.api.readCharacter(a.author, Schemas.profile).then((c) => {
                                                enqueueSnackbar(
                                                    `${c?.payload.body.username ?? 'anonymous'} reacted to "${
                                                        (m.payload.body.body as string) ?? 'your message.'
                                                    }" with ${
                                                        (m.associations.at(-1)?.payload.body.shortcode as string) ??
                                                        'emoji'
                                                    }`
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
                        client?.api.invalidateMessage(event.body.id)
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
            websocketState: readyState,
            displayingStream,
            setThemeName
        }
    }, [emojiDict, readyState, displayingStream])

    if (!client) {
        return <>building api service...</>
    }

    const providers = (childs: JSX.Element): JSX.Element => (
        <SnackbarProvider preventDuplicate>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <ClockContext.Provider value={clock}>
                    <ApiProvider api={client}>
                        <PreferenceProvider>
                            <ApplicationContext.Provider value={applicationContext}>
                                <EmojiPickerProvider>
                                    <GlobalActionsProvider>{childs}</GlobalActionsProvider>
                                </EmojiPickerProvider>
                            </ApplicationContext.Provider>
                        </PreferenceProvider>
                    </ApiProvider>
                </ClockContext.Provider>
            </ThemeProvider>
        </SnackbarProvider>
    )

    return providers(
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    background: `${theme.palette.background.default}, 
                                 linear-gradient(${theme.palette.background.default}, ${darken(
                        theme.palette.background.default,
                        0.1
                    )})`,
                    width: '100vw',
                    height: '100dvh',
                    overflow: 'hidden'
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
                                sm: 'block'
                            },
                            width: '200px',
                            m: 1
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
                                margin: { xs: 0.5, sm: 1 },
                                mb: { xs: 0, sm: '10px' },
                                display: 'flex',
                                flexFlow: 'column',
                                borderRadius: 2,
                                overflow: 'hidden',
                                background: 'none'
                            }}
                        >
                            <Routes>
                                <Route index element={<ListPage messages={messages} />} />
                                <Route path="/stream" element={<StreamPage messages={messages} />} />
                                <Route path="/associations" element={<Associations messages={messages} />} />
                                <Route path="/explorer" element={<Explorer />} />
                                <Route path="/notifications" element={<Notifications messages={messages} />} />
                                <Route path="/settings" element={<Settings />} />
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
        </>
    )
}

export default App
