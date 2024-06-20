import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom'
import { usePreference } from '../context/PreferenceContext'
import { Timeline } from '../components/Timeline'
import { Draft } from '../components/Draft'
import { useClient } from '../context/ClientContext'
import {
    type CreateCurrentOptions,
    type CommunityTimelineSchema,
    type Timeline as CoreTimeline,
    type CoreSubscription,
    type ListSubscriptionSchema
} from '@concurrent-world/client'
import TuneIcon from '@mui/icons-material/Tune'
import ExploreIcon from '@mui/icons-material/Explore'
import { ListSettings } from '../components/ListSettings'
import ListIcon from '@mui/icons-material/List'
import { CCDrawer } from '../components/ui/CCDrawer'
import { TimelineHeader } from '../components/TimelineHeader'
import { type VListHandle } from 'virtua'
import { useGlobalActions } from '../context/GlobalActions'
import { useGlobalState } from '../context/GlobalState'

export function ListPage(): JSX.Element {
    const { client } = useClient()
    const path = useLocation()
    const navigate = useNavigate()
    const { setPostStreams, postStreams } = useGlobalActions()
    const { allKnownTimelines, reloadList } = useGlobalState()
    const [lists, _setLists] = usePreference('lists')
    const [showEditorOnTop] = usePreference('showEditorOnTop')
    const [showEditorOnTopMobile] = usePreference('showEditorOnTopMobile')
    const rawid = path.hash.replace('#', '')
    const id = lists[rawid] ? rawid : Object.keys(lists)[0]
    const [tab, setTab] = useState<string>(id)
    const [subscription, setSubscription] = useState<CoreSubscription<ListSubscriptionSchema> | null>(null)

    const [listSettingsOpen, setListSettingsOpen] = useState<boolean>(false)

    const timelineRef = useRef<VListHandle>(null)

    const timelines = useMemo(() => subscription?.items.map((e) => e.id) ?? [], [subscription])

    const [pinnedSubscriptions, setPinnedSubscriptions] = useState<Array<CoreSubscription<ListSubscriptionSchema>>>([])

    const [updater, setUpdater] = useState<number>(0)

    useEffect(() => {
        if (!id) return
        const list = lists[id]
        if (!list) return

        Promise.all(list.defaultPostStreams.map((streamID) => client.getTimeline(streamID))).then((streams) => {
            setPostStreams(streams.filter((e) => e !== null) as Array<CoreTimeline<CommunityTimelineSchema>>)
        })
    }, [id, lists])

    useEffect(() => {
        Promise.all(
            Object.keys(lists)
                .filter((e) => lists[e].pinned)
                .map((e) => client.api.getSubscription(e))
        ).then((subs) => {
            setPinnedSubscriptions(subs.filter((e) => e !== null) as Array<CoreSubscription<ListSubscriptionSchema>>)
        })
    }, [lists, client])

    useEffect(() => {
        if (id) setTab(id)
    }, [id])

    useEffect(() => {
        navigate(`#${tab}`)
    }, [tab])

    useEffect(() => {
        client.api.getSubscription<ListSubscriptionSchema>(id).then((sub) => {
            if (!sub) return
            setSubscription(sub)
        })
    }, [id, client, updater])

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
                    title={subscription?.document.body.name ?? 'No Name'}
                    titleIcon={<ListIcon />}
                    secondaryAction={<TuneIcon />}
                    onSecondaryActionClick={() => {
                        setListSettingsOpen(true)
                    }}
                    onTitleClick={() => {
                        timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                    }}
                />
                <Tabs
                    value={tab}
                    onChange={(_, newValue) => {
                        setTab(newValue)
                    }}
                    textColor="secondary"
                    indicatorColor="secondary"
                    variant="scrollable"
                    scrollButtons={false}
                >
                    {pinnedSubscriptions.map((sub) => (
                        <Tab
                            key={sub.id}
                            value={sub.id}
                            label={sub.document.body.name}
                            onClick={() => {
                                if (sub.id === tab) {
                                    timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                                }
                            }}
                            sx={{ fontSize: '0.9rem', padding: '0', textTransform: 'none' }}
                        />
                    ))}
                </Tabs>

                {subscription ? (
                    <>
                        {timelines.length > 0 ? (
                            <Timeline
                                header={
                                    <>
                                        <Box
                                            sx={{
                                                display: {
                                                    xs: showEditorOnTopMobile ? 'block' : 'none',
                                                    sm: showEditorOnTop ? 'block' : 'none'
                                                }
                                            }}
                                        >
                                            <Draft
                                                streamPickerOptions={allKnownTimelines}
                                                streamPickerInitial={postStreams}
                                                onSubmit={async (
                                                    text: string,
                                                    destinations: string[],
                                                    options?: CreateCurrentOptions
                                                ): Promise<Error | null> => {
                                                    await client
                                                        .createMarkdownCrnt(text, destinations, options)
                                                        .catch((e) => e)
                                                    return null
                                                }}
                                                sx={{
                                                    p: 1
                                                }}
                                            />
                                            <Divider sx={{ mx: { xs: 0.5, sm: 1, md: 1 } }} />
                                        </Box>
                                    </>
                                }
                                streams={timelines}
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
                                    <Button component={RouterLink} to="/explorer/streams">
                                        <Typography variant="h1" sx={{ fontWeight: 600, mx: 1 }}>
                                            Go Explore
                                        </Typography>
                                        <ExploreIcon sx={{ fontSize: '10rem', verticalAlign: 'middle' }} />
                                    </Button>
                                    <p>フォローするユーザー・ストリームを探しに行く</p>
                                </Box>
                            </Box>
                        )}
                    </>
                ) : (
                    <></>
                )}
            </Box>
            <CCDrawer
                open={listSettingsOpen}
                onClose={() => {
                    setListSettingsOpen(false)
                }}
            >
                {subscription ? (
                    <ListSettings
                        subscription={subscription}
                        onModified={() => {
                            setUpdater((e) => e + 1)
                            reloadList()
                        }}
                    />
                ) : (
                    <>Loading...</>
                )}
            </CCDrawer>
        </>
    )
}
