import { Box, Collapse, Divider, Tab, Tabs } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useClient } from '../context/ClientContext'
import { Schemas, type User } from '@concurrent-world/client'
import { type VListHandle } from 'virtua'
import { TimelineHeader } from '../components/TimelineHeader'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { Profile } from '../components/Profile'
import { QueryTimelineReader } from '../components/QueryTimeline'
import { TimelineFilter } from '../components/TimelineFilter'

export function EntityPage(): JSX.Element {
    const { client } = useClient()
    const { id } = useParams()

    const [user, setUser] = useState<User | null | undefined>(null)

    const timelineRef = useRef<VListHandle>(null)

    const [showHeader, setShowHeader] = useState(false)

    const [tab, setTab] = useState(0)

    const path = useLocation()
    const subCharacterID = path.hash.replace('#', '')

    const [filter, setFilter] = useState<string | undefined>(undefined)

    useEffect(() => {
        if (!id) return
        client.getUser(id).then((user) => {
            setUser(user)
        })
    }, [id])

    const targetTimeline = useMemo(() => {
        let target
        switch (tab) {
            case 0:
            case 1:
                target = user?.homeTimeline
                break
            case 2:
                target = user?.associationTimeline
                break
        }
        return target
    }, [user, tab])

    const query = useMemo(() => {
        switch (tab) {
            case 1:
                return { schema: Schemas.mediaMessage }
            case 2:
                return { schema: filter }
            default:
                return {}
        }
    }, [tab, filter])

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
                        title={user?.profile?.username || 'anonymous'}
                        titleIcon={<AlternateEmailIcon />}
                        onTitleClick={() => {
                            timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                        }}
                    />
                </Collapse>
            </Box>
            {targetTimeline && (
                <QueryTimelineReader
                    ref={timelineRef}
                    timeline={targetTimeline}
                    query={query}
                    perspective={user?.ccid}
                    onScroll={(top) => {
                        setShowHeader(top > 180)
                    }}
                    header={
                        <>
                            <Profile
                                user={user ?? undefined}
                                id={id}
                                overrideSubProfileID={subCharacterID}
                                onSubProfileClicked={(id) => {
                                    window.location.hash = id
                                }}
                            />
                            <Tabs
                                value={tab}
                                onChange={(_, index) => {
                                    setTab(index)
                                }}
                                textColor="secondary"
                                indicatorColor="secondary"
                            >
                                <Tab label="カレント" />
                                <Tab label="メディア" />
                                <Tab label="アクティビティ" />
                            </Tabs>
                            <Divider />
                            {tab === 2 && (
                                <>
                                    <TimelineFilter selected={filter} setSelected={setFilter} sx={{ px: 1 }} />
                                    <Divider />
                                </>
                            )}
                        </>
                    }
                />
            )}
        </Box>
    )
}
