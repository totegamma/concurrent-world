import { useEffect, useState, useRef, useMemo } from 'react'
import { Routes, Route, Link as RouterLink } from 'react-router-dom'
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
import { useClient } from './context/ClientContext'
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
    type Association,
    type ReplyAssociationSchema
} from '@concurrent-world/client'
import { UrlSummaryProvider } from './context/urlSummaryContext'
import { StorageProvider } from './context/StorageContext'
import { MarkdownRendererLite } from './components/ui/MarkdownRendererLite'
import { useTranslation } from 'react-i18next'

function App(): JSX.Element {
    const { client } = useClient()
    const [themeName] = usePreference('themeName')
    const [sound] = usePreference('sound')
    const [customThemes] = usePreference('customThemes')

    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName, customThemes))
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

    const mnemonic = JSON.parse(localStorage.getItem('Mnemonic') || 'null')

    const subscription = useRef<Subscription>()

    const { t } = useTranslation()

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
                                    const profile = c?.[0].payload.body
                                    enqueueSnackbar(
                                        <Box display="flex" flexDirection="column">
                                            <Typography>
                                                {profile?.username ?? 'anonymous'} replied to your message:{' '}
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
                                const profile = c?.[0].payload.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {profile?.username ?? 'anonymous'} rerouted to your message:{' '}
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
                                const profile = c?.[0].payload.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>{profile?.username ?? 'anonymous'} favorited</Typography>
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
                                const profile = c?.[0].payload.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {profile?.username ?? 'anonymous'} reacted{' '}
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
                                const profile = c?.[0].payload.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        {profile?.username ?? 'anonymous'} mentioned you:{' '}
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
                    <UrlSummaryProvider host={client.host}>
                        <EmojiPickerProvider>
                            <StorageProvider>
                                <GlobalActionsProvider>{childs}</GlobalActionsProvider>
                            </StorageProvider>
                        </EmojiPickerProvider>
                    </UrlSummaryProvider>
                </TickerProvider>
            </ThemeProvider>
        </SnackbarProvider>
    )

    return providers(
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
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
                        backgroundColor: 'error.main',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {mnemonic && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'error.contrastText',
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                                padding: '10px'
                            }}
                            component={RouterLink}
                            to="/settings/identity"
                        >
                            {t('settings.identity.loginType.masterKey')}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        maxWidth: '1280px',
                        width: '100%',
                        height: '100%',
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
                                <Route path="/stream/:id" element={<StreamPage />} />
                                <Route path="/associations" element={<Associations />} />
                                <Route path="/contacts" element={<ContactsPage />} />
                                <Route path="/explorer/:tab" element={<Explorer />} />
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
                                    sm: 'none',
                                    md: 'none'
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
