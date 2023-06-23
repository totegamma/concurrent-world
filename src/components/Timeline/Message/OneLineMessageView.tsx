import { Box, Link, Typography, IconButton, ListItem, type Theme } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import type { Profile } from '../../../schemas/profile'
import type ConcurrentApiClient from '../../../apiservice'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import { TimeDiff } from '../../TimeDiff'

export interface MessageViewProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
    author: Character<Profile> | undefined
    reactUsers: ProfileWithAddress[]
    theme: Theme
    hasOwnReaction: boolean
    msgstreams: Array<Stream<any>>
    messageAnchor: null | HTMLElement
    api: ConcurrentApiClient
    inspectHandler: () => void
    handleReply: () => Promise<void>
    unfavorite: () => void
    favorite: () => Promise<void>
    setMessageAnchor: (anchor: null | HTMLElement) => void
    setFetchSucceed: (fetchSucceed: boolean) => void
}

export const OneLineMessageView = (props: MessageViewProps): JSX.Element => {
    if (!props.message?.payload?.body) return <>message not found</>
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
                flex: 1,
                gap: 1
            }}
        >
            <IconButton
                sx={{
                    width: { xs: '12px', sm: '18px' },
                    height: { xs: '12px', sm: '18px' }
                }}
                component={routerLink}
                to={'/entity/' + props.message.author}
            >
                <CCAvatar
                    alt={props.author?.payload.body.username}
                    avatarURL={props.author?.payload.body.avatar}
                    identiconSource={props.message.author}
                    sx={{
                        width: { xs: '12px', sm: '18px' },
                        height: { xs: '12px', sm: '18px' }
                    }}
                />
            </IconButton>
            <Typography
                sx={{
                    fontWeight: '700',
                    fontSize: {
                        xs: '0.8rem',
                        sm: '0.9rem'
                    },
                    flexShrink: 0
                }}
            >
                {props.author?.payload.body.username || 'anonymous'}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'hidden',
                    fontSize: '0.9rem',
                    height: '1.4rem' // FIXME
                }}
            >
                {props.message.payload.body.body}
            </Box>
            <Link
                component="button"
                underline="hover"
                color="inherit"
                sx={{
                    display: 'flex',
                    flexShrink: 0
                }}
            >
                <TimeDiff date={new Date(props.message.cdate)} />
            </Link>
        </Box>
    )
}
