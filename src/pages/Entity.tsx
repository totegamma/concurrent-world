import { Box, Link, Paper, Tab, Tabs, Typography, alpha, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import { CCAvatar } from '../components/ui/CCAvatar'
import { Timeline } from '../components/Timeline'
import Background from '../resources/defaultbg.png'
import CreateIcon from '@mui/icons-material/Create'
import { FollowButton } from '../components/FollowButton'
import { type User } from '@concurrent-world/client'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { TimelineHeader } from '../components/TimelineHeader'
import { CCDrawer } from '../components/ui/CCDrawer'
import { AckList } from '../components/AckList'
import { AckButton } from '../components/AckButton'
import { type VListHandle } from 'virtua'

type detail = 'none' | 'ack' | 'acker'

export function EntityPage(): JSX.Element {
    const client = useApi()
    const theme = useTheme()
    const { id } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState<User | null | undefined>(null)

    const timelineRef = useRef<VListHandle>(null)
    const isSelf = id === client.ccid

    const [ackingUsers, setAckingUsers] = useState<User[]>([])
    const [ackerUsers, setAckerUsers] = useState<User[]>([])

    const [detailMode, setDetailMode] = useState<detail>('none')

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
                minHeight: '100%'
            }}
        >
            <TimelineHeader
                title={user.profile?.payload.body.username || 'anonymous'}
                titleIcon={<AlternateEmailIcon />}
                onTitleClick={() => {
                    timelineRef.current?.scrollTo(0)
                }}
                secondaryAction={isSelf ? <CreateIcon /> : <></>}
                useRawSecondaryAction={!isSelf}
                onSecondaryActionClick={() => {
                    if (isSelf) navigate('/settings')
                }}
            />
            <Timeline
                ref={timelineRef}
                streams={targetStreams}
                perspective={user.ccid}
                header={
                    <>
                        <Box /* profile */
                            sx={{
                                backgroundImage: `url(${user.profile?.payload.body.banner || Background})`,
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Paper
                                sx={{
                                    margin: 3,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                                }}
                            >
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
                                            display: 'flex',
                                            flexFlow: { xs: 'column', sm: 'row', md: 'row' },
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <CCAvatar
                                            alt={user.profile?.payload.body.username}
                                            avatarURL={user.profile?.payload.body.avatar}
                                            identiconSource={user.ccid}
                                            sx={{
                                                width: { xs: '80px', sm: '60px', md: '80px' },
                                                height: { xs: '80px', sm: '60px', md: '80px' }
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexFlow: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                width: '100%',
                                                gap: 0
                                            }}
                                        >
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
                                                ''
                                            )}
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexFlow: 'column',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography>{user.profile?.payload.body.description}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexFlow: 'column',
                                            alignItems: 'flex-end'
                                        }}
                                    >
                                        <Typography variant="caption">
                                            現住所: {user.domain !== '' ? user.domain : client.api.host}
                                        </Typography>
                                        <Typography variant="caption">{user.ccid}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
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
