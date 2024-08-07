import { useEffect, useState, useRef } from 'react'
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
import { usePreference } from './context/PreferenceContext'
import TickerProvider from './context/Ticker'
import { ContactsPage } from './pages/Contacts'
import {
    Schemas,
    type Subscription,
    type ProfileSchema,
    type ReplyAssociationSchema,
    type TimelineEvent,
    type CCDocument
} from '@concurrent-world/client'
import { UrlSummaryProvider } from './context/urlSummaryContext'
import { StorageProvider } from './context/StorageContext'
import { MarkdownRendererLite } from './components/ui/MarkdownRendererLite'
import { useTranslation } from 'react-i18next'
import { ManageSubsPage } from './pages/ManageSubs'
import { UseSoundFormats } from './constants'
import { useGlobalState } from './context/GlobalState'
import { ConcrntLogo } from './components/theming/ConcrntLogo'
import { ConcordPage } from './pages/Concord'

function App(): JSX.Element {
    const { client } = useClient()
    const globalState = useGlobalState()
    const [themeName] = usePreference('themeName')
    const [sound] = usePreference('sound')
    const [customThemes] = usePreference('customThemes')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName, customThemes))
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))
    const subscription = useRef<Subscription>()

    const { t } = useTranslation()

    useEffect(() => {
        if (!client) return
        client.newSubscription().then((sub) => {
            subscription.current = sub
            subscription.current.listen([
                ...(client?.user?.notificationTimeline ? [client?.user?.notificationTimeline] : [])
            ])
            sub.on('AssociationCreated', (event: TimelineEvent) => {
                const a = event.document as CCDocument.Association<any>

                if (!a) return
                if (a.schema === Schemas.replyAssociation) {
                    const replyassociation = a as CCDocument.Association<ReplyAssociationSchema>
                    console.log(replyassociation)
                    client?.api
                        .getMessageWithAuthor(replyassociation.body.messageId, replyassociation.body.messageAuthor)
                        .then((m) => {
                            m &&
                                client?.api
                                    .getProfileBySemanticID<ProfileSchema>('world.concrnt.p', a.signer)
                                    .then((c) => {
                                        playNotificationRef.current()
                                        const profile = c?.document.body
                                        enqueueSnackbar(
                                            <Box display="flex" flexDirection="column">
                                                <Typography>
                                                    {profile?.username ?? 'anonymous'} replied to your message:{' '}
                                                </Typography>
                                                <MarkdownRendererLite
                                                    messagebody={m.document.body.body as string}
                                                    emojiDict={m.document.body.emojis ?? {}}
                                                    limit={128}
                                                />
                                            </Box>
                                        )
                                    })
                        })
                    return
                }

                if (a.schema === Schemas.rerouteAssociation) {
                    client?.api.getMessageWithAuthor(a.target, event.item.owner).then((m) => {
                        m &&
                            client?.api.getProfileBySemanticID<ProfileSchema>('world.concrnt.p', a.signer).then((c) => {
                                playNotificationRef.current()
                                const profile = c?.document.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {profile?.username ?? 'anonymous'} rerouted to your message:{' '}
                                        </Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.document.body.body as string}
                                            emojiDict={m.document.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                    return
                }

                if (a.schema === Schemas.likeAssociation) {
                    client?.api.getMessageWithAuthor(a.target, event.item.owner).then((m) => {
                        m &&
                            client.api.getProfileBySemanticID<ProfileSchema>('world.concrnt.p', a.signer).then((c) => {
                                playNotificationRef.current()
                                const profile = c?.document.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>{profile?.username ?? 'anonymous'} favorited</Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.document.body.body as string}
                                            emojiDict={m.document.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                    return
                }

                if (a.schema === Schemas.reactionAssociation) {
                    client.api.getMessageWithAuthor(a.target, event.item.owner).then((m) => {
                        console.log(m)
                        m &&
                            client.api.getProfileBySemanticID<ProfileSchema>('world.concrnt.p', a.signer).then((c) => {
                                playNotificationRef.current()
                                const profile = c?.document.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        <Typography>
                                            {profile?.username ?? 'anonymous'} reacted{' '}
                                            <img src={a.body.imageUrl as string} style={{ height: '1em' }} />
                                        </Typography>
                                        <MarkdownRendererLite
                                            messagebody={m.document.body.body as string}
                                            emojiDict={m.document.body.emojis ?? {}}
                                            limit={128}
                                        />
                                    </Box>
                                )
                            })
                    })
                }

                if (a.schema === Schemas.mentionAssociation) {
                    client?.api.getMessageWithAuthor(a.target, event.item.owner).then((m) => {
                        m &&
                            client.api.getProfileBySemanticID<ProfileSchema>('world.concrnt.p', a.signer).then((c) => {
                                playNotificationRef.current()
                                const profile = c?.document.body
                                enqueueSnackbar(
                                    <Box display="flex" flexDirection="column">
                                        {profile?.username ?? 'anonymous'} mentioned you:{' '}
                                        <MarkdownRendererLite
                                            messagebody={m.document.body.body as string}
                                            emojiDict={m.document.body.emojis ?? {}}
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

    const [playNotification] = useSound(sound.notification, { volume: sound.volume / 100, format: UseSoundFormats })
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
                    overflow: 'hidden',
                    userSelect: { xs: 'none', sm: 'text', md: 'text' }
                }}
            >
                <Box
                    sx={{
                        backgroundColor: 'error.main',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}
                >
                    {!globalState.isCanonicalUser && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'error.contrastText',
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                                padding: '10px'
                            }}
                        >
                            現在所属ドメインではないドメインにログインしています。引っ越し作業が完了次第、再ログインしてください。
                        </Typography>
                    )}
                    {globalState.isMasterSession && globalState.isCanonicalUser && (
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
                    {globalState.isDomainOffline && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'error.contrastText',
                                fontSize: '0.8em',
                                fontWeight: 'bold',
                                padding: '10px'
                            }}
                        >
                            あなたのドメイン{client.api.host}
                            は現在オフラインの為、読み込み専用モードです。復旧までしばらくお待ちください。
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
                                <Route path="/:id" element={<EntityPage />} />
                                <Route path="/timeline/:id" element={<StreamPage />} />
                                <Route path="/:authorID/:messageID" element={<MessagePage />} />
                                <Route path="/associations" element={<Associations />} />
                                <Route path="/contacts" element={<ContactsPage />} />
                                <Route path="/explorer/:tab" element={<Explorer />} />
                                <Route path="/notifications" element={<Notifications />} />
                                <Route path="/settings/*" element={<Settings />} />
                                <Route path="/devtool" element={<Devtool />} />
                                <Route path="/subscriptions" element={<ManageSubsPage />} />
                                <Route path="/concord/*" element={<ConcordPage />} />
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
                    <ConcrntLogo size="300px" color={theme.palette.background.contrastText} />
                </Box>
            </Box>
        </>
    )
}

export default App
