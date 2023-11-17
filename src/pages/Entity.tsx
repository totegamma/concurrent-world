import { Box, Button, Collapse, Divider, Link, Tab, Tabs, Typography, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link as NavLink } from 'react-router-dom'
import { useApi } from '../context/api'
import { CCAvatar } from '../components/ui/CCAvatar'
import { Timeline } from '../components/Timeline'
import Background from '../resources/defaultbg.png'
import { FollowButton } from '../components/FollowButton'
import { type User } from '@concurrent-world/client'
import { CCDrawer } from '../components/ui/CCDrawer'
import { AckList } from '../components/AckList'
import { AckButton } from '../components/AckButton'
import { type VListHandle } from 'virtua'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'
import { TimelineHeader } from '../components/TimelineHeader'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'

type detail = 'none' | 'ack' | 'acker'

export function EntityPage(): JSX.Element {
    const client = useApi()
    const theme = useTheme()
    const { id } = useParams()

    const [user, setUser] = useState<User | null | undefined>(null)

    const timelineRef = useRef<VListHandle>(null)
    const isSelf = id === client.ccid

    const [ackingUsers, setAckingUsers] = useState<User[]>([])
    const [ackerUsers, setAckerUsers] = useState<User[]>([])

    const [detailMode, setDetailMode] = useState<detail>('none')

    const [showHeader, setShowHeader] = useState(false)

    const [tab, setTab] = useState(0)

    useEffect(() => {
        if (!id) return
        client.getUser(id).then((user) => {
            setUser(user)
        })
    }, [id])

    useEffect(() => {
        let unmounted = false
        if (!user) return
        user.getAcker().then((ackers) => {
            if (unmounted) return
            setAckerUsers(ackers)
        })
        user.getAcking().then((acking) => {
            if (unmounted) return
            setAckingUsers(acking)
        })
        return () => {
            unmounted = true
        }
    }, [user])

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
                            timelineRef.current?.scrollTo(0)
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
                        <Box
                            sx={{
                                backgroundImage: `url(${user.profile?.payload.body.banner || Background})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                height: '150px'
                            }}
                        ></Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexFlow: 'column',
                                gap: 1,
                                p: 1,
                                position: 'relative'
                            }}
                        >
                            <Box position="absolute" top="-50px" left="10px">
                                <CCAvatar
                                    alt={user.profile?.payload.body.username}
                                    avatarURL={user.profile?.payload.body.avatar}
                                    identiconSource={user.ccid}
                                    sx={{
                                        width: '100px',
                                        height: '100px'
                                    }}
                                />
                            </Box>
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                                {!isSelf ? (
                                    <>
                                        <AckButton user={user} />
                                        <FollowButton
                                            color={theme.palette.secondary.main}
                                            userCCID={id!}
                                            userStreamID={user.userstreams?.payload.body.homeStream ?? ''}
                                        />
                                    </>
                                ) : (
                                    <Button variant="outlined" component={NavLink} to="/settings/profile">
                                        Edit Profile
                                    </Button>
                                )}
                            </Box>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem' }
                                    }}
                                >
                                    {user.profile?.payload.body.username || 'anonymous'}
                                </Typography>
                                <Typography variant="caption">{user.ccid}</Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexFlow: 'column'
                                }}
                            >
                                <MarkdownRenderer
                                    messagebody={user.profile?.payload.body.description ?? ''}
                                    emojiDict={{}}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption">
                                    現住所: {user.domain !== '' ? user.domain : client.api.host}
                                </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Typography
                                    component={Link}
                                    underline="hover"
                                    onClick={() => {
                                        setDetailMode('ack')
                                    }}
                                >
                                    {ackingUsers.length} Ack
                                </Typography>
                                <Typography
                                    component={Link}
                                    underline="hover"
                                    onClick={() => {
                                        setDetailMode('acker')
                                    }}
                                >
                                    {ackerUsers.length} Acker
                                </Typography>
                            </Box>
                        </Box>
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
            <CCDrawer
                open={detailMode !== 'none'}
                onClose={() => {
                    setDetailMode('none')
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexFlow: 'column',
                        gap: 1,
                        p: 1
                    }}
                >
                    {detailMode !== 'none' && (
                        <AckList initmode={detailMode === 'ack' ? 'acking' : 'acker'} user={user} />
                    )}
                </Box>
            </CCDrawer>
        </Box>
    )
}
