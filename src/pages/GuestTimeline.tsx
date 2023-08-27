import { useEffect, useRef, useState } from 'react'
import { Box, Button, CssBaseline, Divider, Paper, ThemeProvider, darken } from '@mui/material'
import type { ConcurrentTheme, StreamElementDated } from '../model'
import { useObjectList } from '../hooks/useObjectList'
import { Link, useLocation } from 'react-router-dom'
import { Timeline } from '../components/Timeline/main'
import { Client } from '@concurrent-world/client'
import { FullScreenLoading } from '../components/ui/FullScreenLoading'
import ApiProvider from '../context/api'
import { ClockContext } from '../App'
import { Themes, createConcurrentTheme } from '../themes'
import { usePersistent } from '../hooks/usePersistent'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'

export function GuestTimelinePage(): JSX.Element {
    const reactlocation = useLocation()
    const [queriedStreams, setQueriedStreams] = useState<string[]>([])
    const [title, setTitle] = useState<string>('')

    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        const queriedStreams = reactlocation.hash
            .replace('#', '')
            .split(',')
            .filter((e) => e !== '')
        setQueriedStreams(queriedStreams)

        const resolver = queriedStreams[0].split('@')[1]

        // well-known guest
        // らたい すいか きけんせい うつる てんない にいがた れきだい つながる あたためる みいら よゆう えもの
        const client = new Client('8c215bedacf0888470fd2567d03a813f4ae926be4a2cd587979809b629d70592', resolver)

        initializeClient(client)
    }, [])

    useEffect(() => {
        if (!client) return
        Promise.all(queriedStreams.map((e) => client.api.readStream(e))).then((a) => {
            setTitle(
                a
                    .map((e) => e?.payload.body.name)
                    .filter((e) => e)
                    .join(', ')
            )
        })
    }, [client, queriedStreams])

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

    const [clock, setClock] = useState<Date>(new Date())
    useEffect(() => {
        const timer = setInterval(() => {
            setClock(new Date())
        }, 5000)
        return () => {
            clearInterval(timer)
        }
    }, [setClock])

    if (!client) return <FullScreenLoading message="Loading..." />

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ClockContext.Provider value={clock}>
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
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}
                                            >
                                                <Divider />
                                            </Box>
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
                                                    streams={queriedStreams}
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
            </ClockContext.Provider>
        </ThemeProvider>
    )
}
