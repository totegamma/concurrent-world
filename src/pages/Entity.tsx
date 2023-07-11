import { Box, Button, IconButton, Paper, Tab, Tabs, Typography, Zoom, alpha, useTheme } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import type { Character, Entity, StreamElementDated } from '../model'
import type { Userstreams } from '../schemas/userstreams'
import type { Profile } from '../schemas/profile'
import { Schemas } from '../schemas'
import { CCAvatar } from '../components/CCAvatar'
import { Timeline } from '../components/Timeline'
import { useObjectList } from '../hooks/useObjectList'
import Background from '../resources/defaultbg.png'
import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'
import { FollowButton } from '../components/FollowButton'

export function EntityPage(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const { id } = useParams()
    const [entity, setEntity] = useState<Entity>()
    const [profile, setProfile] = useState<Character<Profile>>()
    const [streams, setStreams] = useState<Character<Userstreams>>()
    const [mode, setMode] = useState<'info' | 'edit'>('info')
    const messages = useObjectList<StreamElementDated>()
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const isSelf = id === api.userAddress

    const [tab, setTab] = useState(0)

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

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
        let target
        switch (tab) {
            case 0:
                target = streams?.payload.body.homeStream
                break
            case 1:
                target = streams?.payload.body.associationStream
                break
        }
        return target ? [target] : []
    }, [streams, tab])

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
                        mr: '8px'
                    }}
                >
                    {isSelf ? (
                        <>
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
                            {mode === 'edit' && <Navigate to="/settings" />}
                        </>
                    ) : (
                        <>{id && <FollowButton userCCID={id} />}</>
                    )}
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
                            ></Box>
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
                                    現住所: {entity.host !== '' ? entity.host : api.host}
                                </Typography>
                                <Typography variant="caption">{entity.ccaddr}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
                <Tabs
                    value={tab}
                    onChange={(_, index) => {
                        setTab(index)
                    }}
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
                        perspective={entity.ccaddr}
                    />
                </Box>
            </Box>
        </Box>
    )
}
