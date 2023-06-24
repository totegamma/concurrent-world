import { Box, IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, type Theme } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
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
    handleReRoute: () => Promise<void>
    unfavorite: () => void
    favorite: () => Promise<void>
    setMessageAnchor: (anchor: null | HTMLElement) => void
    setFetchSucceed: (fetchSucceed: boolean) => void
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
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
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' }
                            }}
                            component={routerLink}
                            to={'/entity/' + props.message.author}
                        >
                            <CCAvatar
                                alt={props.author?.payload.body.username}
                                avatarURL={props.author?.payload.body.avatar}
                                identiconSource={props.message.author}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
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
                            authorID={props.message.author}
                            messageID={props.message.id}
                            cdate={props.message.cdate}
                            username={props.author?.payload.body.username}
                        />
                        <SimpleNote message={props.message} />
                        <MessageActions
                            handleReply={props.handleReply}
                            handleReRoute={props.handleReRoute}
                            reactUsers={props.reactUsers}
                            theme={props.theme}
                            hasOwnReaction={props.hasOwnReaction}
                            unfavorite={props.unfavorite}
                            api={props.api}
                            message={props.message}
                            favorite={props.favorite}
                            setMessageAnchor={props.setMessageAnchor}
                            msgstreams={props.msgstreams}
                        />
                    </Box>
                </>
            )}
            <Menu
                anchorEl={props.messageAnchor}
                open={Boolean(props.messageAnchor)}
                onClose={() => {
                    props.setMessageAnchor(null)
                }}
            >
                <MenuItem
                    onClick={() => {
                        const target: CCMessage<TypeSimpleNote> = props.message
                        navigator.clipboard.writeText(target.payload.body.body)
                        props.setMessageAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ContentPasteIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>ソースをコピー</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        props.inspectHandler()
                        props.setMessageAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ManageSearchIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>詳細</ListItemText>
                </MenuItem>
                {props.message.author === props.api.userAddress && (
                    <MenuItem
                        onClick={() => {
                            props.api.deleteMessage(props.message.id)
                            props.api.invalidateMessage(props.message.id)
                            props.setFetchSucceed(false)
                            props.setMessageAnchor(null)
                        }}
                    >
                        <ListItemIcon>
                            <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>メッセージを削除</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </ListItem>
    )
}
