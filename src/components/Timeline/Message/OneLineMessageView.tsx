import { Box, Link, IconButton, type Theme, Typography } from '@mui/material'
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
                overflow: 'hidden',
                flex: 1,
                gap: 1
            }}
        >
            <IconButton
                sx={{
                    width: { xs: '32px', sm: '48px' },
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
                        width: { xs: '32px', sm: '48px' },
                        height: { xs: '12px', sm: '18px' }
                    }}
                />
            </IconButton>
            <Box display="flex" flex={1} overflow="hidden">
                <Typography
                    overflow="hidden"
                    fontSize="0.9rem"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    minWidth={0}
                >
                    {props.message.payload.body.body}
                </Typography>
            </Box>
            <Link
                component="button"
                underline="hover"
                color="inherit"
                sx={{
                    display: 'flex',
                    flexShrink: 0,
                    fontSize: '0.8rem'
                }}
            >
                <TimeDiff date={new Date(props.message.cdate)} />
            </Link>
        </Box>
    )
}
