import { Box, Collapse, Divider, Tab, Tabs } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import { Timeline } from '../components/Timeline'
import { type User } from '@concurrent-world/client'
import { type VListHandle } from 'virtua'
import { TimelineHeader } from '../components/TimelineHeader'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Profile } from '../components/Profile'

export function EntityPage(): JSX.Element {
    const client = useApi()
    const { id } = useParams()

    const [user, setUser] = useState<User | null | undefined>(null)

    const timelineRef = useRef<VListHandle>(null)

    const [showHeader, setShowHeader] = useState(false)

    const [tab, setTab] = useState(0)

    useEffect(() => {
        if (!id) return
        client.getUser(id).then((user) => {
            setUser(user)
        })
    }, [id])

    const targetStreams = useMemo(() => {
        let target
        switch (tab) {
            case 0:
                target = user?.userstreams?.payload.body.homeStream
                break
            case 1:
                target = user?.userstreams?.payload.body.associationStream
                break
        }
        return target ? [target] : []
    }, [user, tab])

    if (!user) {
        return <>loading...</>
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                position: 'relative'
            }}
        >
            <Box position="absolute" top="0" left="0" width="100%" zIndex="1">
                <Collapse in={showHeader}>
                    <TimelineHeader
                        title={user.profile?.payload.body.username || 'anonymous'}
                        titleIcon={<AlternateEmailIcon />}
                        onTitleClick={() => {
                            timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                        }}
                    />
                </Collapse>
            </Box>
            <Timeline
                ref={timelineRef}
                streams={targetStreams}
                perspective={user.ccid}
                onScroll={(top) => {
                    setShowHeader(top > 180)
                }}
                header={
                    <>
                        <Profile user={user} id={id} />
                        <Tabs
                            value={tab}
                            onChange={(_, index) => {
                                setTab(index)
                            }}
                            textColor="secondary"
                            indicatorColor="secondary"
                        >
                            <Tab label="カレント" />
                            <Tab label="アクティビティ" />
                        </Tabs>
                        <Divider />
                    </>
                }
            />
        </Box>
    )
}
