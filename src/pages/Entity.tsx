import { Box, Paper, Tab, Tabs, Typography, alpha, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import type { StreamElementDated } from '../model'
import { CCAvatar } from '../components/ui/CCAvatar'
import { Timeline } from '../components/Timeline'
import { useObjectList } from '../hooks/useObjectList'
import Background from '../resources/defaultbg.png'
import CreateIcon from '@mui/icons-material/Create'
import { FollowButton } from '../components/FollowButton'
import { type User } from '@concurrent-world/client'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { TimelineHeader } from '../components/TimelineHeader'

export function EntityPage(): JSX.Element {
    const client = useApi()
    const theme = useTheme()
    const { id } = useParams()
    const navigate = useNavigate()

    const [user, setUser] = useState<User | null | undefined>(null)

    const messages = useObjectList<StreamElementDated>()
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const isSelf = id === client.ccid

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
                target = user?.userstreams?.homeStream
                break
            case 1:
                target = user?.userstreams?.associationStream
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
                title={user.profile?.username || 'anonymous'}
                titleIcon={<AlternateEmailIcon />}
                onTitleClick={() => {
                    scrollParentRef.current?.scroll({
                        top: 0,
                        behavior: 'smooth'
                    })
                }}
                secondaryAction={
                    isSelf ? (
                        <CreateIcon />
                    ) : (
                        <FollowButton userCCID={id!} userStreamID={user.userstreams?.homeStream ?? ''} />
                    )
                }
                useRawSecondaryAction={!isSelf}
                onSecondaryActionClick={() => {
                    if (isSelf) navigate('/settings')
                }}
            />
            <Box /* body */
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: '100%',
                    minHeight: '100%'
                }}
                ref={scrollParentRef}
            >
                <Box /* profile */
                    sx={{
                        backgroundImage: `url(${user.profile?.banner || Background})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Paper
                        sx={{
                            position: 'relative',
                            margin: '50px',
                            backgroundColor: alpha(theme.palette.background.paper, 0.8)
                        }}
                    >
                        <CCAvatar
                            alt={user.profile?.username}
                            avatarURL={user.profile?.avatar}
                            identiconSource={user.ccid}
                            sx={{
                                width: '80px',
                                height: '80px',
                                position: 'absolute',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
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
                                    height: '32px',
                                    display: 'flex',
                                    flexFlow: 'row-reverse'
                                }}
                            ></Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexFlow: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography>{user.profile?.description}</Typography>
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
                <Box /* timeline */
                    sx={{
                        padding: { xs: '8px', sm: '8px 16px' }
                    }}
                >
                    <Timeline
                        streams={targetStreams}
                        timeline={messages}
                        scrollParentRef={scrollParentRef}
                        perspective={user.ccid}
                    />
                </Box>
            </Box>
        </Box>
    )
}
