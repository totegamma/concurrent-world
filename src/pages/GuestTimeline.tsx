import { useEffect, useRef, useState } from 'react'
import { Box, Button, Divider, Paper } from '@mui/material'
import { useLocation, useParams, Link as NavLink } from 'react-router-dom'
import { Timeline } from '../components/Timeline/main'
import { Client, type User } from '@concurrent-world/client'
import { FullScreenLoading } from '../components/ui/FullScreenLoading'
import ApiProvider from '../context/ClientContext'
import TickerProvider from '../context/Ticker'

import { type VListHandle } from 'virtua'
import { TimelineHeader } from '../components/TimelineHeader'

import ListIcon from '@mui/icons-material/List'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Profile } from '../components/Profile'
import { MessageContainer } from '../components/Message/MessageContainer'
import { GuestBase } from '../components/GuestBase'

export interface GuestPageProps {
    page: 'timeline' | 'entity' | 'message'
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
            case 'timeline':
                {
                    setTargetStream([id])
                    const resolver = id.split('@')[1]
                    const client = new Client(resolver)
                    initializeClient(client)

                    client.api.getTimeline(id).then((e) => {
                        console.log(e)
                        setTitle(e?.document.body.name ?? '')
                    })
                    setUser(undefined)
                }
                break
            case 'entity':
                {
                    const client = new Client('ariake.concrnt.net')
                    initializeClient(client)

                    client.getUser(id).then((e) => {
                        setUser(e)
                        setTitle(e?.profile?.username ?? '')
                        setTargetStream([e?.homeTimeline ?? ''])
                    })
                }
                break
            case 'message':
                {
                    const client = new Client('ariake.concrnt.net')
                    initializeClient(client)

                    const authorID = id.split('@')[1]

                    client.getUser(authorID).then((e) => {
                        setUser(e)
                        setTitle(e?.profile?.username ?? '')
                        setTargetStream([e?.homeTimeline ?? ''])
                    })
                }
                break
        }
    }, [props.page, id, reactlocation.hash])

    const scrollParentRef = useRef<HTMLDivElement>(null)

    if (!client) return <FullScreenLoading message="Loading..." />

    return (
        <GuestBase
            sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                gap: 1,
                flex: 1
            }}
            additionalButton={
                <Button component={NavLink} to="/register">
                    はじめる
                </Button>
            }
        >
            <TickerProvider>
                <ApiProvider client={client}>
                    <>
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
                                flex: 1,
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
                                    flexDirection: 'column',
                                    flex: 1
                                }}
                            >
                                <TimelineHeader title={title} titleIcon={id ? <AlternateEmailIcon /> : <ListIcon />} />

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
                    </>
                </ApiProvider>
            </TickerProvider>
        </GuestBase>
    )
}
