import { Box, Divider, Paper, Typography } from '@mui/material'
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

export function EntityPage(): JSX.Element {
    const api = useApi()
    const { id } = useParams()
    const [entity, setEntity] = useState<Entity>()
    const [profile, setProfile] = useState<Character<Profile>>()
    const [streams, setStreams] = useState<Character<Userstreams>>()
    const messages = useObjectList<StreamElementDated>()
    const scrollParentRef = useRef<HTMLDivElement>(null)

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
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'primary.contrastText',
                    backgroundColor: 'primary.main',
                    p: '2px'
                }}
            >
                <b>{profile.payload.body.username}</b>
            </Box>
            <Box /* profile */
                sx={{
                    backgroundColor: 'background.default'
                }}
            >
                <Paper
                    sx={{
                        position: 'relative',
                        margin: '50px'
                    }}
                >
                    <CCAvatar
                        alt={profile.payload.body.username}
                        avatarURL={profile.payload.body.avatar}
                        identiconSource={entity.ccaddr}
                        sx={{
                            width: '64px',
                            height: '64px',
                            position: 'absolute',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                    <Box
                        sx={{
                            p: '40px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            flexFlow: 'column'
                        }}
                    >
                        <Typography>アドレス: {entity.ccaddr}</Typography>
                        <Typography>現住所: {entity.host !== '' ? entity.host : api.host?.fqdn}</Typography>
                        <Typography>Home: {streams.payload.body.homeStream}</Typography>
                        <Typography>Notification: {streams.payload.body.notificationStream}</Typography>
                        <Typography>Association: {streams.payload.body.associationStream}</Typography>
                        <Divider />
                        <Typography>{profile.payload.body.description}</Typography>
                    </Box>
                </Paper>
            </Box>
            <Box /* timeline */
                sx={{
                    overflowX: 'hidden',
                    width: '100%',
                    minHeight: '100%',
                    padding: { xs: '8px', sm: '8px 16px' },
                    overflowY: 'scroll'
                }}
                ref={scrollParentRef}
            >
                <Timeline streams={targetStreams} timeline={messages} scrollParentRef={scrollParentRef} />
            </Box>
        </Box>
    )
}
