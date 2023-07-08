import { useState, useEffect, memo } from 'react'
import { Box, IconButton, Typography } from '@mui/material'

import type { Character, Message as CCMessage } from '../../../model'
import RepeatIcon from '@mui/icons-material/Repeat'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { MessageFrame } from './MessageFrame'
import { CCAvatar } from '../../CCAvatar'
import { Link as routerLink } from 'react-router-dom'
import { TimeDiff } from '../../TimeDiff'

export interface ReRouteMessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated: number
    thin?: boolean
}

export const ReRouteMessageFrame = (props: ReRouteMessageFrameProp): JSX.Element => {
    const api = useApi()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()

    const [reRouteMessage, setReRouteMessage] = useState<CCMessage<any> | undefined>()

    useEffect(() => {
        api.readCharacter(props.message.author, Schemas.profile).then((e) => {
            setAuthor(e)
        })

        api.fetchMessageWithAuthor(
            props.message.payload.body.rerouteMessageId,
            props.message.payload.body.rerouteMessageAuthor
        ).then((e) => {
            setReRouteMessage(e)
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
                            xs: '0.8rem',
                            sm: '0.9rem'
                        },
                        color: 'text.disabled',
                        fontWeight: 700,
                        flex: 1
                    }}
                >
                    {author?.payload.body.username || 'Anonymous'} rerouted
                </Typography>
                <Box
                    color="text.disabled"
                    fontSize={{
                        xs: '0.7rem',
                        sm: '0.8rem'
                    }}
                >
                    <TimeDiff date={new Date(props.message.cdate)} />
                </Box>
            </Box>
            {reRouteMessage ? (
                <Box>
                    <MessageFrame message={reRouteMessage} lastUpdated={0} reloadMessage={props.reloadMessage} />
                </Box>
            ) : (
                <Typography color="text.disabled" fontWeight="700">
                    But now it&apos;s gone...
                </Typography>
            )}
        </>
    )
}
