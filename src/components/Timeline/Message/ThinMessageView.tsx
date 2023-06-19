import { Box, IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, type Theme } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream, StreamElement } from '../../../model'
import { SimpleNote } from '../SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { Profile } from '../../../schemas/profile'
import type ConcurrentApiClient from '../../../apiservice'
import React from 'react'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import type { ReplyMessage } from '../../../schemas/replyMessage'

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

export const ThinMessageView = (props: MessageViewProps): JSX.Element => {
    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                p: { xs: '7px 0', sm: '10px 0' },
                wordBreak: 'break-word'
            }}
        >
            {props.message?.payload?.body && (
                <>
                    <Box
                        sx={{
                            padding: {
                                xs: '5px 8px 0 0',
                                sm: '8px 10px 0 0'
                            }
                        }}
                    >
                        <IconButton
                            sx={{
                                width: { xs: '24px', sm: '36px' },
                                height: { xs: '24px', sm: '36px' }
                            }}
                            component={routerLink}
                            to={'/entity/' + props.message.author}
                        >
                            <CCAvatar
                                alt={props.author?.payload.body.username}
                                avatarURL={props.author?.payload.body.avatar}
                                identiconSource={props.message.author}
                                sx={{
                                    width: { xs: '24px', sm: '36px' },
                                    height: { xs: '24px', sm: '36px' }
                                }}
                            />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <MessageHeader
                            authorAddress={props.message.author}
                            cdate={props.message.cdate}
                            username={props.author?.payload.body.username}
                        />
                        <SimpleNote message={props.message} />
                    </Box>
                </>
            )}
        </ListItem>
    )
}
