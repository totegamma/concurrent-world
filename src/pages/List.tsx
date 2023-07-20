import { Box, Button, Collapse, Divider, IconButton, Tab, Tabs, TextField, Zoom, useTheme } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePreference } from '../context/PreferenceContext'
import { type ConcurrentTheme, type StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Timeline } from '../components/Timeline'
import { Draft } from '../components/Draft'
import { useApi } from '../context/api'
import { ConcurrentLogo } from '../components/ConcurrentLogo'
import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'

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

    const [listName, setListName] = useState<string>('')

    useEffect(() => {
        if (id) {
            const list = pref.lists[id]
            if (list) {
                setListName(list.label)
            }
            setTab(id)
        }
    }, [id])

    useEffect(() => {
        navigate(`#${tab}`)
    }, [tab])

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
                                streams: []
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
                    p: { xs: '', sm: '2px 2px 2px 16px' },
                    width: '100%'
                }}
            >
                <IconButton
                    sx={{
                        p: '8px',
                        display: { xs: 'inherit', sm: 'none' }
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
                onChange={(_, index) => {
                    setTab(index)
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
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                p: 1
                            }}
                        >
                            <TextField
                                label="list name"
                                variant="outlined"
                                value={listName}
                                sx={{
                                    flexGrow: 1
                                }}
                                onChange={(e) => {
                                    setListName(e.target.value)
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={(_) => {
                                    const old = pref.lists
                                    old[id] = {
                                        label: listName,
                                        pinned: old[id].pinned,
                                        streams: old[id].streams
                                    }
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                }}
                            >
                                Update
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={(_) => {
                                    const old = pref.lists
                                    old[id] = {
                                        label: listName,
                                        pinned: !old[id].pinned,
                                        streams: old[id].streams
                                    }
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                }}
                            >
                                {pref.lists[id].pinned ? 'Unpin' : 'Pin'}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={(_) => {
                                    const old = pref.lists
                                    delete old[id]
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                }}
                            >
                                Delete
                            </Button>
                        </Box>
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
                                streamPickerInitial={pref.defaultPostHome}
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
                <Box sx={{ display: 'flex', flex: 1, py: { xs: 1, sm: 1 }, px: { xs: 1, sm: 2 } }}>
                    <Timeline
                        streams={pref.lists[id].streams}
                        timeline={props.messages}
                        scrollParentRef={scrollParentRef}
                    />
                </Box>
            </Box>
        </Box>
    )
}
