import { useState, useEffect } from 'react'
import { Box, IconButton, Typography } from '@mui/material'

import { type Character, type Message as CCMessage, Schemas, type Profile } from '@concurrent-world/client'
import RepeatIcon from '@mui/icons-material/Repeat'
import { useApi } from '../../../context/api'
import { CCAvatar } from '../../CCAvatar'
import { Link as routerLink } from 'react-router-dom'
import { TimeDiff } from '../../TimeDiff'
import { MessageContainer } from '../MessageContainer'

export interface ReRouteMessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated?: number
    thin?: boolean
}

export const ReRouteMessageFrame = (props: ReRouteMessageFrameProp): JSX.Element => {
    const api = useApi()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()

    useEffect(() => {
        api.readCharacter(props.message.author, Schemas.profile).then((e) => {
            setAuthor(e)
        })
    }, [props.message, props.lastUpdated])

    return (
        <>
            <Box display="flex" alignItems="center" gap={1}>
                <Box
                    display="flex"
                    width={{ xs: '38px', sm: '48px' }}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <RepeatIcon sx={{ fontSize: '90%' }} />
                    <IconButton
                        sx={{
                            width: { xs: '12px', sm: '18px' },
                            height: { xs: '12px', sm: '18px' }
                        }}
                        component={routerLink}
                        to={'/entity/' + props.message.author}
                    >
                        <CCAvatar
                            avatarURL={author?.payload.body.avatar}
                            identiconSource={props.message.author}
                            sx={{
                                width: { xs: '12px', sm: '18px' },
                                height: { xs: '12px', sm: '18px' }
                            }}
                        />
                    </IconButton>
                </Box>
                <Typography
                    sx={{
                        fontSize: {
                            xs: '0.9rem',
                            sm: '1rem'
                        },
                        color: 'text.disabled',
                        fontWeight: 700,
                        flex: 1
                    }}
                >
                    {author?.payload.body.username || 'Anonymous'} rerouted
                </Typography>
                <Box color="text.disabled" fontSize="0.75rem">
                    <TimeDiff date={new Date(props.message.cdate)} />
                </Box>
            </Box>
            <MessageContainer
                messageID={props.message.payload.body.rerouteMessageId}
                messageOwner={props.message.payload.body.rerouteMessageAuthor}
            />
        </>
    )
}
