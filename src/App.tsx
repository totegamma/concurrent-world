import { useEffect, useState, createContext, useRef, useMemo, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, CssBaseline } from '@mui/material'
import useWebSocket, { type ReadyState } from 'react-use-websocket'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { useObjectList } from './hooks/useObjectList'

import { Schemas, type CoreServerEvent } from '@concurrent-world/client'
import { createConcurrentTheme } from './themes'
import { Menu } from './components/Menu/Menu'
import type { StreamElementDated, ConcurrentTheme } from './model'
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

import useSound from 'use-sound'
import { MobileMenu } from './components/Menu/MobileMenu'
import { useApi } from './context/api'
import { GlobalActionsProvider } from './context/GlobalActions'
import { EmojiPickerProvider } from './context/EmojiPickerContext'

import { ThinMenu } from './components/Menu/ThinMenu'
import { type UserAckCollection } from '@concurrent-world/client/dist/types/schemas/userAckCollection'
import { type CollectionItem } from '@concurrent-world/client/dist/types/model/core'
import { ConcurrentLogo } from './components/theming/ConcurrentLogo'
import { usePreference } from './context/PreferenceContext'
import TickerProvider from './context/Ticker'

export const ApplicationContext = createContext<appData>({
    websocketState: -1,
    displayingStream: [],
    acklist: [],
    updateAcklist: () => {}
})

export interface appData {
    websocketState: ReadyState
    displayingStream: string[]
    acklist: Array<CollectionItem<UserAckCollection>>
    updateAcklist: () => void
}

function App(): JSX.Element {
    const client = useApi()
    const pref = usePreference()

    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(pref.themeName))
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

    const path = useLocation()
    const displayingStream: string[] = useMemo(() => {
        switch (path.pathname) {
            case '/': {
                const rawid = path.hash.replace('#', '')
                const list = pref.lists[rawid] ?? Object.values(pref.lists)[0]
                if (!list) return []
                console.log(list)
                return [...list.streams, list.userStreams.map((e) => e.streamID)].flat()
            }
            case '/stream':
            case '/stream/': {
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

    const { lastMessage, readyState, sendJsonMessage } = useWebSocket(`wss://${client.host}/api/v1/socket`, {
        shouldReconnect: (_) => true,
        reconnectInterval: (attempt) => Math.min(Math.pow(2, attempt) * 1000, 10000),
        onOpen: (_) => {
            sendJsonMessage({ channels: displayingStream })
        }
    })

    const [playBubble] = useSound(pref.postSound, { volume: pref.volume / 100 })
    const [playNotification] = useSound(pref.notificationSound, { volume: pref.volume / 100 })
    const playBubbleRef = useRef(playBubble)
    const playNotificationRef = useRef(playNotification)
    useEffect(() => {
        playBubbleRef.current = playBubble
        playNotificationRef.current = playNotification
    }, [playBubble, playNotification])

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
        const newtheme = createConcurrentTheme(pref.themeName)
        setTheme(newtheme)
        let themeColorMetaTag: HTMLMetaElement = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
        if (!themeColorMetaTag) {
            themeColorMetaTag = document.createElement('meta')
            themeColorMetaTag.name = 'theme-color'
            document.head.appendChild(themeColorMetaTag)
        }
        themeColorMetaTag.content = newtheme.palette.background.default
    }, [pref.themeName])

    const applicationContext = useMemo(() => {
        return {
            websocketState: readyState,
            displayingStream,
            acklist,
            updateAcklist
        }
    }, [readyState, displayingStream, acklist, updateAcklist])

    if (!client) {
        return <>building api service...</>
    }

    const providers = (childs: JSX.Element): JSX.Element => (
        <SnackbarProvider preventDuplicate>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <TickerProvider>
                    <ApplicationContext.Provider value={applicationContext}>
                        <EmojiPickerProvider>
                            <GlobalActionsProvider>{childs}</GlobalActionsProvider>
                        </EmojiPickerProvider>
                    </ApplicationContext.Provider>
                </TickerProvider>
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
                                <Route path="/settings/*" element={<Settings />} />
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
                <Box
                    sx={{
                        position: 'fixed',
                        zIndex: '-1',
                        opacity: { xs: '0.2', sm: '0.1' },
                        left: '-30px',
                        bottom: '-30px',
                        width: '300px',
                        height: '300px',
                        display: {
                            xs: 'none',
                            sm: 'block',
                            md: 'block'
                        }
                    }}
                >
                    <ConcurrentLogo
                        size="300px"
                        upperColor={theme.palette.background.contrastText}
                        lowerColor={theme.palette.background.contrastText}
                        frameColor={theme.palette.background.contrastText}
                    />
                </Box>
            </Box>
        </>
    )
}

export default App
