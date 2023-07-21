import { Box, Button, Collapse, Divider, IconButton, Tab, Tabs, Typography, Zoom, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import { usePreference } from '../context/PreferenceContext'
import { type ConcurrentTheme, type StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Timeline } from '../components/Timeline'
import { Draft } from '../components/Draft'
import { useApi } from '../context/api'
import { ConcurrentLogo } from '../components/ConcurrentLogo'
import { type Stream } from '@concurrent-world/client'
import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'
import ExploreIcon from '@mui/icons-material/Explore'
import { ListSettings } from '../components/ListSettings'

export interface ListPageProps {
    messages: IuseObjectList<StreamElementDated>
}

export function ListPage(props: ListPageProps): JSX.Element {
    const client = useApi()
    const path = useLocation()
    const navigate = useNavigate()
    const pref = usePreference()
    const rawid = path.hash.replace('#', '')
    const id = pref.lists[rawid] ? rawid : Object.keys(pref.lists)[0]
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const [mode, setMode] = useState<'compose' | 'settings'>('compose')
    const [tab, setTab] = useState<string>(id)

    const [streams, setStreams] = useState<Stream[]>([])
    const [postStreams, setPostStreams] = useState<Stream[]>([])

    useEffect(() => {
        if (!id) return
        const list = pref.lists[id]
        if (!list) return
        Promise.all(list.streams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setStreams(streams.filter((e) => e !== null) as Stream[])
        })

        Promise.all(list.defaultPostStreams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setPostStreams(streams.filter((e) => e !== null) as Stream[])
        })
    }, [id, pref.lists])

    useEffect(() => {
        if (id) {
            setTab(id)
        }
    }, [id])

    useEffect(() => {
        navigate(`#${tab}`)
    }, [tab])

    const streamIDs = useMemo(() => {
        return [...(pref.lists[id]?.streams ?? []), pref.lists[id]?.userStreams.map((e) => e.streamID) ?? []].flat()
    }, [id])

    const theme = useTheme<ConcurrentTheme>()
    const iconColor = theme.palette.background.contrastText

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

    if (!pref.lists[id]) {
        return (
            <Box>
                <div>list not found</div>
                <Button
                    variant="contained"
                    onClick={() => {
                        pref.setLists({
                            home: {
                                label: 'Home',
                                pinned: true,
                                streams: [],
                                userStreams: [],
                                expanded: false,
                                defaultPostStreams: []
                            }
                        })
                        window.location.reload()
                    }}
                >
                    治す
                </Button>
            </Box>
        )
    }

    return (
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
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'primary.main',
                    p: { xs: '', sm: '2px 2px 2px 2px' },
                    width: '100%'
                }}
            >
                <IconButton
                    sx={{
                        p: '8px'
                    }}
                    onClick={() => {}}
                >
                    <ConcurrentLogo size="25px" upperColor={iconColor} lowerColor={iconColor} frameColor={iconColor} />
                </IconButton>
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
                    <b>{pref.lists[id].label}</b>
                </Button>
                <Box sx={{ position: 'relative', width: '40px', height: '40px', mr: '8px' }}>
                    <Zoom
                        in={mode === 'settings'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'settings' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: 1, position: 'absolute' }}
                            onClick={() => {
                                setMode('compose')
                            }}
                        >
                            <CreateIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={mode === 'compose'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'compose' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: 1, position: 'absolute' }}
                            onClick={() => {
                                setMode('settings')
                            }}
                        >
                            <InfoIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                </Box>
            </Box>

            <Tabs
                value={tab}
                onChange={(_, newValue) => {
                    setTab(newValue)
                }}
            >
                {Object.keys(pref.lists)
                    .filter((e) => pref.lists[e].pinned)
                    .map((e) => (
                        <Tab key={e} value={e} label={pref.lists[e].label} />
                    ))}
            </Tabs>

            <Box
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
                ref={scrollParentRef}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Collapse in={mode === 'settings'}>
                        <ListSettings id={id} />
                    </Collapse>
                    <Collapse in={mode === 'compose'}>
                        <Box
                            sx={{
                                padding: { xs: '8px', sm: '8px 16px' },
                                display: {
                                    xs: pref.showEditorOnTopMobile ? 'block' : 'none',
                                    sm: pref.showEditorOnTop ? 'block' : 'none'
                                }
                            }}
                        >
                            <Draft
                                streamPickerOptions={streams}
                                streamPickerInitial={postStreams}
                                onSubmit={(text: string, destinations: string[]): Promise<Error | null> => {
                                    client
                                        .createCurrent(text, destinations)
                                        .then(() => {
                                            return null
                                        })
                                        .catch((e) => {
                                            return e
                                        })
                                    return Promise.resolve(null)
                                }}
                            />
                        </Box>
                    </Collapse>

                    <Divider />
                </Box>
                {streamIDs.length > 0 ? (
                    <Box sx={{ display: 'flex', flex: 1, py: { xs: 1, sm: 1 }, px: { xs: 1, sm: 2 } }}>
                        <Timeline streams={streamIDs} timeline={props.messages} scrollParentRef={scrollParentRef} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            marginTop: 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box
                            style={{
                                display: 'flex',
                                marginTop: 8,
                                marginLeft: 8,
                                marginRight: 8,
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Button variant="contained" component={RouterLink} to="/explorer">
                                <Typography variant="h1" sx={{ fontWeight: 600, mx: 1 }}>
                                    Go Explore
                                </Typography>
                                <ExploreIcon sx={{ fontSize: '10rem', verticalAlign: 'middle' }} />
                            </Button>
                            <p>フォローするユーザー・ストリームを探しに行く</p>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
