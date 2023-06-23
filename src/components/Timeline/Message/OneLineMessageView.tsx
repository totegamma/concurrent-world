import {
    Box,
    Link,
    Typography,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    type Theme
} from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream, StreamElement } from '../../../model'
import { SimpleNote } from '../SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import type { Profile } from '../../../schemas/profile'
import type ConcurrentApiClient from '../../../apiservice'
import React from 'react'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
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
    return (
        <ListItem
            sx={{
                alignItems: 'center',
                padding: '0 0 0 32px'
            }}
        >
            {props.message?.payload?.body && (
                <>
                    <ChatBubbleOutlineIcon sx={{ fontSize: '100%' }} />
                    <Box
                        sx={{
                            padding: { xs: '0 0 0 10px' },
                            display: 'flex'
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
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                            overflow: 'hidden',
                            pl: '4px'
                        }}
                    >
                        <Typography
                            color="text.disabled"
                            sx={{
                                fontWeight: '700',
                                fontSize: {
                                    xs: '0.8rem',
                                    sm: '0.9rem'
                                },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
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
                            <SimpleNote message={props.message} />
                        </Box>
                        <Link
                            component="button"
                            underline="hover"
                            color="inherit"
                            sx={{ marginLeft: 'auto', width: 'max-content', display: 'flex' }}
                        >
                            <TimeDiff date={new Date(props.message.cdate)} />
                        </Link>
                    </Box>
                </>
            )}
        </ListItem>
    )
}
