import { useEffect, useState, createContext, useRef, useMemo, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { darken, Box, Paper, ThemeProvider, CssBaseline, Typography, useMediaQuery } from '@mui/material'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'

import { loadConcurrentTheme } from './themes'
import { Menu } from './components/Menu/Menu'
import type { ConcurrentTheme } from './model'
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
import { type StreamEvent } from '@concurrent-world/client/dist/types/model/core'
import { ConcurrentLogo } from './components/theming/ConcurrentLogo'
import { usePreference } from './context/PreferenceContext'
import TickerProvider from './context/Ticker'
import { ContactsPage } from './pages/Contacts'
import {
    type CoreAssociation,
    Schemas,
    type Subscription,
    type ProfileSchema,
    type User,
    type Association,
    type ReplyAssociationSchema
} from '@concurrent-world/client'
import { UrlSummaryProvider } from './context/urlSummaryContext'
import { StorageProvider } from './context/StorageContext'
import { MarkdownRendererLite } from './components/ui/MarkdownRendererLite'

export const ApplicationContext = createContext<appData>({
    displayingStream: [],
    acklist: [],
    updateAcklist: () => {}
})

export interface appData {
    displayingStream: string[]
    acklist: User[]
    updateAcklist: () => void
}

function App(): JSX.Element {
    const client = useApi()
    const [themeName] = usePreference('themeName')
    const [lists] = usePreference('lists')
    const [sound] = usePreference('sound')
    const [customThemes] = usePreference('customThemes')

    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName, customThemes))
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

    const [acklist, setAcklist] = useState<User[]>([])
    const updateAcklist = useCallback(() => {
        client.user?.getAcking().then((acklist) => {
            setAcklist(acklist)
        })
    }, [client, client?.user])

    useEffect(() => {
        updateAcklist()
    }, [client, client?.user])

    const subscription = useRef<Subscription>()

    useEffect(() => {
        if (!client) return
        client.newSubscription().then((sub) => {
            subscription.current = sub
            subscription.current.listen([
                ...(client?.user?.userstreams?.payload.body.notificationStream
                    ? [client?.user?.userstreams.payload.body.notificationStream]
                    : [])
            ])
            sub.on('AssociationCreated', (event: StreamEvent) => {
                const a = event.body as CoreAssociation<any>
                if (!a) return
                if (a.schema === Schemas.replyAssociation) {
                    const replyassociation = a as Association<ReplyAssociationSchema>
                    console.log(replyassociation)
                    client?.api
                        .getMessageWithAuthor(
                            replyassociation.payload.body.messageId,
                            replyassociation.payload.body.messageAuthor
                        )
                        .then((m) => {
                            m &&
                                client?.api.getCharacter<ProfileSchema>(a.author, Schemas.profile).then((c) => {
                                    playNotificationRef.current()
                                    enqueueSnackbar(
                                        <Box display="flex" flexDirection="column">
                                            <Typography>
                                                {c?.payload.body.username ?? 'anonymous'} replied to your message:{' '}
                                            </Typography>
                                            <MarkdownRendererLite
                                                messagebody={m.payload.body.body as string}
                                                emojiDict={m.payload.body.emojis ?? {}}
                                                limit={128}
                                            />
                                        </Box>
                                    )
                                })
                        })
                    return
                }

                if (a.schema === Schemas.rerouteAssociation) {
                    client?.api.getMessageWithAuthor(a.targetID, event.item.owner).then((m) => {
                        m &&
                            client?.api.getCharacter<ProfileSchema>(a.author, Schemas.profile).then((c) => {
                                playNotificationRef.current()
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {c?.payload.body.username ?? 'anonymous'} rerouted to your message:{' '}
                                        </Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.payload.body.body as string}
                                            emojiDict={m.payload.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                    return
                }

                if (a.schema === Schemas.like) {
                    client?.api.getMessageWithAuthor(a.targetID, event.item.owner).then((m) => {
                        m &&
                            client.api.getCharacter<ProfileSchema>(a.author, Schemas.profile).then((c) => {
                                playNotificationRef.current()
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>{c?.payload.body.username ?? 'anonymous'} favorited</Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.payload.body.body as string}
                                            emojiDict={m.payload.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                    return
                }

                if (a.schema === Schemas.emojiAssociation) {
                    client.api.getMessageWithAuthor(a.targetID, event.item.owner).then((m) => {
                        console.log(m)
                        m &&
                            client.api.getCharacter<ProfileSchema>(a.author, Schemas.profile).then((c) => {
                                playNotificationRef.current()
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {c?.payload.body.username ?? 'anonymous'} reacted{' '}
                                            <img src={a.payload.body.imageUrl as string} style={{ height: '1em' }} />
                                        </Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.payload.body.body as string}
                                            emojiDict={m.payload.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                }

                if (a.schema === Schemas.mention) {
                    client?.api.getMessageWithAuthor(a.targetID, event.item.owner).then((m) => {
                        m &&
                            client.api.getCharacter<ProfileSchema>(a.author, Schemas.profile).then((c) => {
                                playNotificationRef.current()
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        {c?.payload.body.username ?? 'anonymous'} mentioned you:{' '}
                                        <MarkdownRendererLite
                                            messagebody={m.payload.body.body as string}
                                            emojiDict={m.payload.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                }
            })
        })
    }, [client])

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
            case '/stream':
            case '/stream/': {
                return path.hash.replace('#', '').split(',')
            }
            case '/notifications': {
                const notifications = client?.user?.userstreams?.payload.body.notificationStream
                if (!notifications) return []
                return [notifications]
            }
            case '/associations': {
                const associations = client?.user?.userstreams?.payload.body.associationStream
                if (!associations) return []
                return [associations]
            }
            default: {
                return []
            }
        }
    }, [client, path])

    const [playNotification] = useSound(sound.notification, { volume: sound.volume / 100 })
    const playNotificationRef = useRef(playNotification)
    useEffect(() => {
        playNotificationRef.current = playNotification
    }, [playNotification])

    useEffect(() => {
        const newtheme = loadConcurrentTheme(themeName, customThemes)
        setTheme(newtheme)
        let themeColorMetaTag: HTMLMetaElement = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
        if (!themeColorMetaTag) {
            themeColorMetaTag = document.createElement('meta')
            themeColorMetaTag.name = 'theme-color'
            document.head.appendChild(themeColorMetaTag)
        }
        themeColorMetaTag.content = newtheme.palette.background.default
    }, [themeName, customThemes])

    const applicationContext = useMemo(() => {
        return {
            displayingStream,
            acklist,
            updateAcklist
        }
    }, [displayingStream, acklist, updateAcklist])

    if (!client) {
        return <>building api service...</>
    }

    const providers = (childs: JSX.Element): JSX.Element => (
        <SnackbarProvider
            preventDuplicate
            classes={isMobileSize ? { containerRoot: 'snackbar-container-mobile' } : undefined}
        >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <TickerProvider>
                    <ApplicationContext.Provider value={applicationContext}>
                        <UrlSummaryProvider host={client.host}>
                            <EmojiPickerProvider>
                                <StorageProvider>
                                    <GlobalActionsProvider>{childs}</GlobalActionsProvider>
                                </StorageProvider>
                            </EmojiPickerProvider>
                        </UrlSummaryProvider>
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
                                <Route index element={<ListPage />} />
                                <Route path="/stream" element={<StreamPage />} />
                                <Route path="/associations" element={<Associations />} />
                                <Route path="/contacts" element={<ContactsPage />} />
                                <Route path="/explorer" element={<Explorer />} />
                                <Route path="/notifications" element={<Notifications />} />
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
