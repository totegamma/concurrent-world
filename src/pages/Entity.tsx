import { Box, Button, Collapse, Divider, IconButton, Paper, Typography, Zoom, alpha, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import type { Character, Entity, StreamElementDated } from '../model'
import type { Userstreams } from '../schemas/userstreams'
import type { Profile } from '../schemas/profile'
import { Schemas } from '../schemas'
import { CCAvatar } from '../components/CCAvatar'
import { Timeline } from '../components/Timeline'
import { useObjectList } from '../hooks/useObjectList'
import { useFollow } from '../context/FollowContext'
import Background from '../resources/defaultbg.png'
import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'
import { ProfileEditor } from '../components/ProfileEditor'
import { useSnackbar } from 'notistack'

export function EntityPage(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const followService = useFollow()
    const { enqueueSnackbar } = useSnackbar()
    const { id } = useParams()
    const [entity, setEntity] = useState<Entity>()
    const [profile, setProfile] = useState<Character<Profile>>()
    const [streams, setStreams] = useState<Character<Userstreams>>()
    const [mode, setMode] = useState<'info' | 'edit'>('info')
    const messages = useObjectList<StreamElementDated>()
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const following = id && followService.followingUsers.includes(id)

    useEffect(() => {
        if (!id) return
        api.readEntity(id).then((e) => {
            setEntity(e)
        })
        api.readCharacter(id, Schemas.profile).then((e) => {
            setProfile(e)
        })
        api.readCharacter(id, Schemas.userstreams).then((e) => {
            setStreams(e)
        })
    }, [id])

    const targetStreams = useMemo(() => {
        return streams?.payload.body.homeStream ? [streams.payload.body.homeStream] : []
    }, [streams])

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

    if (!entity || !profile || !streams) {
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
            <Box /* header */
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'primary.contrastText',
                    backgroundColor: 'primary.main',
                    p: '2px'
                }}
            >
                <Box sx={{ width: '40px', ml: '8px' }}></Box>
                <Button
                    sx={{
                        color: 'primary.contrastText'
                    }}
                    onClick={() => {
                        scrollParentRef.current?.scroll({
                            top: 0,
                            behavior: 'smooth'
                        })
                    }}
                    disableRipple
                >
                    <b>{profile.payload.body.username || 'anonymous'}</b>
                </Button>
                <Box
                    sx={{
                        position: 'relative',
                        width: '40px',
                        height: '40px',
                        mr: '8px',
                        visibility: id === api.userAddress ? 'visible' : 'hidden'
                    }}
                >
                    <Zoom
                        in={mode === 'info'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'info' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                setMode('edit')
                            }}
                        >
                            <CreateIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={mode === 'edit'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${mode === 'edit' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                setMode('info')
                            }}
                        >
                            <InfoIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                </Box>
            </Box>
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
                        backgroundImage: `url(${profile.payload.body.banner || Background})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    <Collapse in={mode === 'info'}>
                        <Paper
                            sx={{
                                position: 'relative',
                                margin: '50px',
                                backgroundColor: alpha(theme.palette.background.paper, 0.8)
                            }}
                        >
                            <CCAvatar
                                alt={profile.payload.body.username}
                                avatarURL={profile.payload.body.avatar}
                                identiconSource={entity.ccaddr}
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
                                >
                                    {following ? (
                                        <Button
                                            variant={'outlined'}
                                            onClick={() => {
                                                followService.unfollowUser(id)
                                            }}
                                        >
                                            Following
                                        </Button>
                                    ) : (
                                        <Button
                                            variant={'contained'}
                                            onClick={() => {
                                                id && followService.followUser(id)
                                            }}
                                        >
                                            Follow
                                        </Button>
                                    )}
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexFlow: 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography>{profile.payload.body.description}</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexFlow: 'column',
                                        alignItems: 'flex-end'
                                    }}
                                >
                                    <Typography variant="caption">
                                        現住所: {entity.host !== '' ? entity.host : api.host?.fqdn}
                                    </Typography>
                                    <Typography variant="caption">{entity.ccaddr}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Collapse>
                    <Collapse in={mode === 'edit'}>
                        <ProfileEditor
                            initial={profile}
                            onSubmit={() => enqueueSnackbar('プロフィールを更新しました', { variant: 'success' })}
                        />
                    </Collapse>
                </Box>
                <Box /* timeline */
                    sx={{
                        padding: { xs: '8px', sm: '8px 16px' }
                    }}
                >
                    <Timeline streams={targetStreams} timeline={messages} scrollParentRef={scrollParentRef} />
                </Box>
            </Box>
        </Box>
    )
}
