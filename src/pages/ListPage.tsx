import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import { usePreference } from '../context/PreferenceContext'
import { Timeline } from '../components/Timeline'
import { Draft } from '../components/Draft'
import { useApi } from '../context/api'
import { CommonstreamSchema, type Stream } from '@concurrent-world/client'
import InfoIcon from '@mui/icons-material/Info'
import ExploreIcon from '@mui/icons-material/Explore'
import { ListSettings } from '../components/ListSettings'
import ListIcon from '@mui/icons-material/List'
import { CCDrawer } from '../components/ui/CCDrawer'
import { TimelineHeader } from '../components/TimelineHeader'
import { type VListHandle } from 'virtua'

export function ListPage(): JSX.Element {
    const client = useApi()
    const path = useLocation()
    const navigate = useNavigate()
    const pref = usePreference()
    const rawid = path.hash.replace('#', '')
    const id = pref.lists[rawid] ? rawid : Object.keys(pref.lists)[0]
    const [tab, setTab] = useState<string>(id)

    const [streams, setStreams] = useState<Stream<CommonstreamSchema>[]>([])
    const [postStreams, setPostStreams] = useState<Stream<CommonstreamSchema>[]>([])
    const [listSettingsOpen, setListSettingsOpen] = useState<boolean>(false)

    const timelineRef = useRef<VListHandle>(null)

    useEffect(() => {
        if (!id) return
        const list = pref.lists[id]
        if (!list) return
        Promise.all(list.streams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setStreams(streams.filter((e) => e !== null) as Stream<CommonstreamSchema>[])
        })

        Promise.all(list.defaultPostStreams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setPostStreams(streams.filter((e) => e !== null) as Stream<CommonstreamSchema>[])
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
    }, [id, pref.lists])

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
        <>
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
                    title={pref.lists[id].label}
                    titleIcon={<ListIcon />}
                    secondaryAction={<InfoIcon />}
                    onSecondaryActionClick={() => {
                        setListSettingsOpen(true)
                    }}
                    onTitleClick={() => {
                        timelineRef.current?.scrollTo(0)
                    }}
                />
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => {
                        setTab(newValue)
                    }}
                    textColor="secondary"
                    indicatorColor="secondary"
                >
                    {Object.keys(pref.lists)
                        .filter((e) => pref.lists[e].pinned)
                        .map((e) => (
                            <Tab
                                key={e}
                                value={e}
                                label={pref.lists[e].label}
                                onClick={() => {
                                    console.log('click', e, tab)
                                    if (e === tab) {
                                        timelineRef.current?.scrollTo(0)
                                    }
                                }}
                            />
                        ))}
                </Tabs>

                {streamIDs.length > 0 ? (
                    <Timeline
                        header={
                            <>
                                <Box
                                    sx={{
                                        px: 1,
                                        display: {
                                            xs: pref.showEditorOnTopMobile ? 'block' : 'none',
                                            sm: pref.showEditorOnTop ? 'block' : 'none'
                                        }
                                    }}
                                >
                                    <Draft
                                        streamPickerOptions={streams}
                                        streamPickerInitial={postStreams}
                                        onSubmit={(
                                            text: string,
                                            destinations: string[],
                                            emojis
                                        ): Promise<Error | null> => {
                                            client
                                                .createCurrent(text, destinations, emojis)
                                                .then(() => {
                                                    return null
                                                })
                                                .catch((e) => {
                                                    return e
                                                })
                                            return Promise.resolve(null)
                                        }}
                                    />
                                    <Divider
                                        sx={{
                                            my: 1
                                        }}
                                    />
                                </Box>
                            </>
                        }
                        streams={streamIDs}
                        ref={timelineRef}
                    />
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
            <CCDrawer
                open={listSettingsOpen}
                onClose={() => {
                    setListSettingsOpen(false)
                }}
            >
                <ListSettings id={id} />
            </CCDrawer>
        </>
    )
}
