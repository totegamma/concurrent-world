import { useEffect, useRef, useState } from 'react'
import { Box, Button, CssBaseline, Paper, ThemeProvider, Typography, alpha, darken } from '@mui/material'
import type { ConcurrentTheme, StreamElementDated } from '../model'
import { useObjectList } from '../hooks/useObjectList'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Timeline } from '../components/Timeline/main'
import { Client, type User } from '@concurrent-world/client'
import { FullScreenLoading } from '../components/ui/FullScreenLoading'
import ApiProvider from '../context/api'
import { Themes, createConcurrentTheme } from '../themes'
import { usePersistent } from '../hooks/usePersistent'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import TickerProvider from '../context/Ticker'
import { CCAvatar } from '../components/ui/CCAvatar'

import Background from '../resources/defaultbg.png'

export function GuestTimelinePage(): JSX.Element {
    const reactlocation = useLocation()
    const [title, setTitle] = useState<string>('')
    const [user, setUser] = useState<User | null | undefined>(null)
    const [targetStream, setTargetStream] = useState<string[]>([])

    const { id } = useParams()

    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        if (id) {
            // entity mode
            const client = new Client(
                '8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592',
                'hub.concurrent.world'
            )
            client.getUser(id).then((e) => {
                setUser(e)
                setTitle(e?.profile?.username ?? '')
                setTargetStream([e?.userstreams?.homeStream ?? ''])
            })

            initializeClient(client)
        } else {
            // stream mode
            const query = reactlocation.hash.replace('#', '')
            setTargetStream([query])
            const resolver = query.split('@')[1]
            // well-known guest
            // らたい すいか きけんせい うつる てんない にいがた れきだい つながる あたためる みいら よゆう えもの
            const client = new Client('8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592', resolver)

            client.api.readStream(query).then((e) => {
                setTitle(e?.payload.body.name ?? '')
            })

            initializeClient(client)
        }
    }, [])

    const [themeName, setThemeName] = usePersistent<string>('Theme', 'sacher')
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(createConcurrentTheme(newThemeName))
    }

    const messages = useObjectList<StreamElementDated>()

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
                                        <Button variant="contained" onClick={randomTheme}>
                                            ✨
                                        </Button>
                                        <Button variant="contained" component={Link} to="/register">
                                            はじめる
                                        </Button>
                                    </Box>
                                </Box>

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
                                    <Box
                                        sx={{
                                            width: '100%',
                                            minHeight: '100%',
                                            backgroundColor: 'background.paper',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: theme.palette.primary.main
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: { xs: '', sm: '2px 2px 2px 16px' },
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                    borderRadius: '9999px',
                                                    background: 'none'
                                                }}
                                            >
                                                <Button
                                                    sx={{
                                                        width: 1,
                                                        justifyContent: {
                                                            xs: 'flex-left'
                                                        },
                                                        color: 'primary.contrastText',
                                                        p: { xs: '0', xl: '8px 0 8 4px' }
                                                    }}
                                                    onClick={() => {
                                                        scrollParentRef.current?.scroll({
                                                            top: 0,
                                                            behavior: 'smooth'
                                                        })
                                                    }}
                                                    disableRipple
                                                >
                                                    <b>{title}</b>
                                                </Button>
                                            </Box>
                                        </Box>
                                        <Box
                                            sx={{
                                                overflowX: 'hidden',
                                                overflowY: 'auto',
                                                overscrollBehaviorY: 'contain'
                                            }}
                                            ref={scrollParentRef}
                                        >
                                            {user && (
                                                <Box /* profile */
                                                    sx={{
                                                        backgroundImage: `url(${user.profile?.banner || Background})`,
                                                        backgroundPosition: 'center',
                                                        backgroundSize: 'cover',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                >
                                                    <Paper
                                                        sx={{
                                                            position: 'relative',
                                                            margin: '50px',
                                                            backgroundColor: alpha(theme.palette.background.paper, 0.8)
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)'
                                                            }}
                                                        >
                                                            <CCAvatar
                                                                alt={user.profile?.username}
                                                                avatarURL={user.profile?.avatar}
                                                                identiconSource={user.ccid}
                                                                sx={{
                                                                    width: '80px',
                                                                    height: '80px'
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                p: '10px',
                                                                display: 'flex',
                                                                flexFlow: 'column',
                                                                gap: '15px'
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    height: '32px',
                                                                    display: 'flex',
                                                                    flexFlow: 'row',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-end',
                                                                    gap: 1
                                                                }}
                                                            ></Box>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexFlow: 'column',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Typography>{user.profile?.description}</Typography>
                                                            </Box>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    flexFlow: 'column',
                                                                    alignItems: 'flex-end'
                                                                }}
                                                            >
                                                                <Typography variant="caption">
                                                                    現住所:{' '}
                                                                    {user.domain !== '' ? user.domain : client.api.host}
                                                                </Typography>
                                                                <Typography variant="caption">{user.ccid}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            )}

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    py: { xs: 1, sm: 1 },
                                                    px: { xs: 1, sm: 2 }
                                                }}
                                            >
                                                <Timeline
                                                    streams={targetStream}
                                                    timeline={messages}
                                                    scrollParentRef={scrollParentRef}
                                                />
                                            </Box>
                                        </Box>
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
