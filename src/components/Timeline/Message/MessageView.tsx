import {
    Box,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Popover,
    type PopoverActions
} from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import { SimpleNote } from '../SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { Profile } from '../../../schemas/profile'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import { EmojiPicker } from '../../EmojiPicker'
import { useRef } from 'react'
import { useMessageService } from '../Multiplexer'

export interface MessageViewProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
    author: Character<Profile> | undefined
    reactUsers: ProfileWithAddress[]
    emojiUsers: ProfileWithAddress[]
    hasOwnReaction: boolean
    msgstreams: Array<Stream<any>>
    messageAnchor: null | HTMLElement
    emojiPickerAnchor: null | HTMLElement
    userCCID: string
    inspectHandler: () => void
    handleReply: () => Promise<void>
    handleReRoute: () => Promise<void>
    setMessageAnchor: (anchor: null | HTMLElement) => void
    setEmojiPickerAnchor: (anchor: null | HTMLElement) => void
    beforeMessage?: JSX.Element
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
    const repositionEmojiPicker = useRef<PopoverActions | null>(null)

    const service = useMessageService()

    return (
        <ListItem
            sx={{
                wordBreak: 'break-word',
                alignItems: 'flex-start',
                flex: 1,
                gap: { xs: 1, sm: 2 }
            }}
            disablePadding
        >
            {props.message?.payload?.body && (
                <>
                    <IconButton
                        sx={{
                            width: { xs: '38px', sm: '48px' },
                            height: { xs: '38px', sm: '48px' },
                            mt: { xs: '3px', sm: '5px' }
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
                        {props.beforeMessage}
                        <SimpleNote message={props.message} />
                        <MessageReactions message={props.message} emojiUsers={props.emojiUsers} />
                        <MessageActions
                            handleReply={props.handleReply}
                            handleReRoute={props.handleReRoute}
                            reactUsers={props.reactUsers}
                            hasOwnReaction={props.hasOwnReaction}
                            message={props.message}
                            setMessageAnchor={props.setMessageAnchor}
                            setEmojiPickerAnchor={props.setEmojiPickerAnchor}
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
                {props.message.author === props.userCCID && (
                    <MenuItem
                        onClick={() => {
                            service.deleteMessage()
                        }}
                    >
                        <ListItemIcon>
                            <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>メッセージを削除</ListItemText>
                    </MenuItem>
                )}
            </Menu>
            <Popover
                anchorEl={props.emojiPickerAnchor}
                open={Boolean(props.emojiPickerAnchor)}
                onClose={() => {
                    props.setEmojiPickerAnchor(null)
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                action={repositionEmojiPicker}
            >
                <EmojiPicker
                    onSelected={(emoji) => {
                        service.addReaction(emoji.shortcodes, emoji.src)
                        props.setEmojiPickerAnchor(null)
                    }}
                    onMounted={() => {
                        repositionEmojiPicker.current?.updatePosition()
                    }}
                />
            </Popover>
        </ListItem>
    )
}
