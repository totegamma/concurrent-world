import { useEffect, useRef, useState } from 'react'
import { Box, Button, CssBaseline, Divider, Paper, ThemeProvider, darken } from '@mui/material'
import type { ConcurrentTheme } from '../model'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Timeline } from '../components/Timeline/main'
import { Client, type User } from '@concurrent-world/client'
import { FullScreenLoading } from '../components/ui/FullScreenLoading'
import ApiProvider from '../context/api'
import { Themes, loadConcurrentTheme } from '../themes'
import { usePersistent } from '../hooks/usePersistent'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import TickerProvider from '../context/Ticker'

import { type VListHandle } from 'virtua'
import { TimelineHeader } from '../components/TimelineHeader'

import ListIcon from '@mui/icons-material/List'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Profile } from '../components/Profile'
import { MessageContainer } from '../components/Message/MessageContainer'

export interface GuestPageProps {
    page: 'stream' | 'entity' | 'message'
}

export function GuestTimelinePage(props: GuestPageProps): JSX.Element {
    const reactlocation = useLocation()
    const [title, setTitle] = useState<string>('')
    const [user, setUser] = useState<User | null | undefined>(null)
    const [targetStream, setTargetStream] = useState<string[]>([])

    const { id } = useParams()

    const timelineRef = useRef<VListHandle>(null)

    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        if (!id) return

        switch (props.page) {
            case 'stream':
                {
                    const query = reactlocation.hash.replace('#', '')
                    setTargetStream([query])
                    const resolver = query.split('@')[1]
                    // well-known guest
                    // らたい すいか きけんせい うつる てんない にいがた れきだい つながる あたためる みいら よゆう えもの
                    const client = new Client(
                        '8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592',
                        resolver
                    )

                    client.api.getStream(query).then((e) => {
                        console.log(e)
                        setTitle(e?.payload.name ?? '')
                    })
                    setUser(undefined)

                    initializeClient(client)
                }
                break
            case 'entity':
                {
                    const client = new Client(
                        '8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592',
                        'hub.concurrent.world'
                    )
                    client.getUser(id).then((e) => {
                        setUser(e)
                        setTitle(e?.profile?.payload.body.username ?? '')
                        setTargetStream([e?.userstreams?.payload.body.homeStream ?? ''])
                    })

                    initializeClient(client)
                }
                break
            case 'message':
                {
                    const client = new Client(
                        '8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592',
                        'hub.concurrent.world'
                    )
                    initializeClient(client)

                    const authorID = id.split('@')[1]

                    client.getUser(authorID).then((e) => {
                        setUser(e)
                        setTitle(e?.profile?.payload.body.username ?? '')
                        setTargetStream([e?.userstreams?.payload.body.homeStream ?? ''])
                    })
                }
                break
        }
    }, [props.page, id, reactlocation.hash])

    const [themeName, setThemeName] = usePersistent<string>('Theme', 'sacher')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName))
    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(loadConcurrentTheme(newThemeName))
    }

    const scrollParentRef = useRef<HTMLDivElement>(null)

    if (!client) return <FullScreenLoading message="Loading..." />

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TickerProvider>
                <ApiProvider client={client}>
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
                                    display: 'flex',
                                    flexFlow: 'column',
                                    overflow: 'hidden',
                                    flex: 1
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" mt={2} mx={2}>
                                    <Button
                                        disableRipple
                                        variant="text"
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: 'none'
                                            }
                                        }}
                                        component={Link}
                                        to="/welcome"
                                    >
                                        <ConcurrentWordmark color={theme.palette.background.contrastText} />
                                    </Button>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: '10px'
                                        }}
                                    >
                                        <Button onClick={randomTheme}>✨</Button>
                                        <Button component={Link} to="/register">
                                            はじめる
                                        </Button>
                                    </Box>
                                </Box>

                                {props.page === 'message' && (
                                    <Paper
                                        sx={{
                                            margin: { xs: 0.5, sm: 1 },
                                            display: 'flex',
                                            flexFlow: 'column',
                                            p: 2
                                        }}
                                    >
                                        <MessageContainer
                                            messageID={id?.split('@')[0] ?? ''}
                                            messageOwner={id?.split('@')[1] ?? ''}
                                        />
                                    </Paper>
                                )}

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
                                    <Box
                                        sx={{
                                            width: '100%',
                                            minHeight: '100%',
                                            backgroundColor: 'background.paper',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <TimelineHeader
                                            title={title}
                                            titleIcon={id ? <AlternateEmailIcon /> : <ListIcon />}
                                        />

                                        <Timeline
                                            ref={timelineRef}
                                            streams={targetStream}
                                            header={
                                                <Box
                                                    sx={{
                                                        overflowX: 'hidden',
                                                        overflowY: 'auto',
                                                        overscrollBehaviorY: 'contain'
                                                    }}
                                                    ref={scrollParentRef}
                                                >
                                                    {user && (
                                                        <>
                                                            <Profile user={user} id={id} guest={true} />
                                                            <Divider />
                                                        </>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>
                </ApiProvider>
            </TickerProvider>
        </ThemeProvider>
    )
}
