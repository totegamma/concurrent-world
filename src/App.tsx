import { useEffect, useState, createContext, useRef, useMemo, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, CssBaseline } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'

import { Client, Schemas, type CoreServerEvent } from '@concurrent-world/client'
import { Themes, createConcurrentTheme } from './themes'
import { Menu } from './components/Menu/Menu'
import type { StreamElementDated, ConcurrentTheme, StreamList } from './model'
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
import { ThinMenu } from './components/Menu/ThinMenu'
import { type UserAckCollection } from '@concurrent-world/client/dist/types/schemas/userAckCollection'
import { type CollectionItem } from '@concurrent-world/client/dist/types/model/core'
const branchName = branch || window.location.host.split('.')[0]
const versionString = `${location.hostname}-${branchName as string}-${sha.slice(0, 7) as string}`

export const ApplicationContext = createContext<appData>({
    websocketState: -1,
    displayingStream: [],
    setThemeName: (_newtheme: string) => {},
    postSound: BubbleSound,
    setPostSound: (_sound: any) => {},
    notificationSound: NotificationSound,
    setNotificationSound: (_sound: any) => {},
    volume: 0.5,
    setVolume: (_volume: number) => {},
    acklist: [],
    updateAcklist: () => {}
})

export interface appData {
    websocketState: ReadyState
    displayingStream: string[]
    setThemeName: (newtheme: string) => void
    postSound: any
    setPostSound: (sound: any) => void
    notificationSound: any
    setNotificationSound: (sound: any) => void
    volume: number
    setVolume: (volume: number) => void
    acklist: Array<CollectionItem<UserAckCollection>>
    updateAcklist: () => void
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
    const [postSound, setPostSound] = usePersistent<any>('PostSound', BubbleSound)
    const [notificationSound, setNotificationSound] = usePersistent<any>('NotificationSound', NotificationSound)
    const [volume, setVolume] = usePersistent<number>('Volume', 50)

    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const messages = useObjectList<StreamElementDated>()

    const [acklist, setAcklist] = useState<Array<CollectionItem<UserAckCollection>>>([])
    const updateAcklist = useCallback(() => {
        if (!client) return
        const collectionID = client.user?.userstreams?.ackCollection
        if (!collectionID) return
        client.api.readCollection<UserAckCollection>(collectionID).then((ackCollection) => {
            if (!ackCollection) return
            setAcklist(ackCollection.items)
        })
    }, [client, client?.user])

    useEffect(() => {
        updateAcklist()
    }, [client, client?.user])

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
    }, [client, path])

    const { lastMessage, readyState, sendJsonMessage } = useWebSocket(`wss://${domain}/api/v1/socket`, {
        shouldReconnect: (_) => true,
        reconnectInterval: (attempt) => Math.min(Math.pow(2, attempt) * 1000, 10000),
        onOpen: (_) => {
            sendJsonMessage({ channels: displayingStream })
        }
    })

    const [playBubble] = useSound(postSound, { volume: volume / 100 })
    const [playNotification] = useSound(notificationSound, { volume: volume / 100 })
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
                            client?.api.readAssociation(event.body.id, event.body.domain).then((a) => {
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
            websocketState: readyState,
            displayingStream,
            setThemeName,
            postSound,
            setPostSound,
            notificationSound,
            setNotificationSound,
            volume,
            setVolume,
            acklist,
            updateAcklist
        }
    }, [
        readyState,
        displayingStream,
        setThemeName,
        postSound,
        setPostSound,
        notificationSound,
        setNotificationSound,
        volume,
        setVolume,
        acklist,
        updateAcklist
    ])

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
                        width: '100%',
                        marginLeft: 'env(safe-area-inset-left)',
                        marginRight: 'env(safe-area-inset-right)'
                    }}
                >
                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                sm: 'none',
                                md: 'block'
                            },
                            width: '200px',
                            m: 1
                        }}
                    >
                        <Menu />
                    </Box>
                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                sm: 'block',
                                md: 'none'
                            },
                            width: '50px',
                            m: 1
                        }}
                    >
                        <ThinMenu />
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
