import { Box, Button, Typography, useTheme, Link } from '@mui/material'

import { CCAvatar } from '../components/ui/CCAvatar'
import { FollowButton } from '../components/FollowButton'
import { AckButton } from '../components/AckButton'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'

import { Link as NavLink } from 'react-router-dom'

import Background from '../resources/defaultbg.png'
import { useEffect, useState } from 'react'
import { type User } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { CCDrawer } from './ui/CCDrawer'
import { AckList } from '../components/AckList'

export interface ProfileProps {
    user: User
    id?: string
    guest?: boolean
}

type detail = 'none' | 'ack' | 'acker'

export function Profile(props: ProfileProps): JSX.Element {
    const client = useApi()
    const theme = useTheme()

    const isSelf = props.id === client.ccid

    const [detailMode, setDetailMode] = useState<detail>('none')
    const [ackingUsers, setAckingUsers] = useState<User[]>([])
    const [ackerUsers, setAckerUsers] = useState<User[]>([])

    useEffect(() => {
        let unmounted = false
        if (!props.user) return
        props.user.getAcker().then((ackers) => {
            if (unmounted) return
            setAckerUsers(ackers)
        })
        props.user.getAcking().then((acking) => {
            if (unmounted) return
            setAckingUsers(acking)
        })
        return () => {
            unmounted = true
        }
    }, [props.user])

    return (
        <>
            <Box
                sx={{
                    backgroundImage: `url(${props.user.profile?.payload.body.banner || Background})`,
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
                        alt={props.user.profile?.payload.body.username}
                        avatarURL={props.user.profile?.payload.body.avatar}
                        identiconSource={props.user.ccid}
                        sx={{
                            width: '100px',
                            height: '100px'
                        }}
                    />
                </Box>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    visibility={props.guest ? 'hidden' : 'visible'}
                >
                    {!isSelf ? (
                        <>
                            <AckButton user={props.user} />
                            <FollowButton
                                color={theme.palette.secondary.main}
                                userCCID={props.id!}
                                userStreamID={props.user.userstreams?.payload.body.homeStream ?? ''}
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
                        {props.user.profile?.payload.body.username || 'anonymous'}
                    </Typography>
                    <Typography variant="caption">{props.user.ccid}</Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexFlow: 'column'
                    }}
                >
                    <MarkdownRenderer messagebody={props.user.profile?.payload.body.description ?? ''} emojiDict={{}} />
                </Box>
                <Box>
                    <Typography variant="caption">
                        現住所: {props.user.domain !== '' ? props.user.domain : client.api.host}
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
                        <AckList initmode={detailMode === 'ack' ? 'acking' : 'acker'} user={props.user} />
                    )}
                </Box>
            </CCDrawer>
        </>
    )
}
