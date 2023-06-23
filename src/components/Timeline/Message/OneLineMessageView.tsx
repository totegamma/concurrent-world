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
        <ListItem
            sx={{
                alignItems: 'center',
                color: 'text.disabled',
                gap: 1
            }}
            disablePadding
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
                    whiteSpace: 'nowrap',
                    width: 'auto'
                }}
            >
                {props.author?.payload.body.username || 'anonymous'}
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '0.9rem'
                }}
            >
                {props.message.payload.body.body}
            </Box>
            <Link
                component="button"
                underline="hover"
                color="inherit"
                sx={{ marginLeft: 'auto', width: 'max-content', display: 'flex' }}
            >
                <TimeDiff date={new Date(props.message.cdate)} />
            </Link>
        </ListItem>
    )
}
