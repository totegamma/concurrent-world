import {
    Box,
    IconButton,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Popover,
    type PopoverActions,
    Tooltip,
    Typography
} from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { CCAvatar } from '../../CCAvatar'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RepeatIcon from '@mui/icons-material/Repeat'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import type { Stream, Message as CCMessage, ProfileWithAddress } from '../../../model'
import { Schemas } from '../../../schemas'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import { useRef, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import { useMessageService } from '../Multiplexer'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { EmojiPicker } from '../../EmojiPicker'

export interface MessageActionsProps {
    reactUsers: ProfileWithAddress[]
    hasOwnReaction: boolean
    message: CCMessage<TypeSimpleNote>
    msgstreams: Array<Stream<any>>
    userCCID: string
}

export const MessageActions = (props: MessageActionsProps): JSX.Element => {
    const [streamListOpen, setStreamListOpen] = useState<boolean>(false)
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null)
    const repositionEmojiPicker = useRef<PopoverActions | null>(null)
    const service = useMessageService()

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '1.5rem',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: { xs: 3, sm: 4 }
                    }}
                >
                    {/* left */}
                    <IconButton
                        sx={{
                            p: '0',
                            color: 'text.secondary'
                        }}
                        onClick={() => {
                            service.openReply()
                        }}
                    >
                        <ReplyIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <IconButton
                        sx={{
                            p: '0',
                            color: 'text.secondary'
                        }}
                        onClick={() => {
                            service.openReroute()
                        }}
                    >
                        <RepeatIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <Tooltip
                        arrow
                        title={
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                {props.reactUsers.map((user) => (
                                    <Box
                                        key={user.ccaddress}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <CCAvatar
                                            sx={{
                                                height: '20px',
                                                width: '20px'
                                            }}
                                            avatarURL={user.avatar}
                                            identiconSource={user.ccaddress}
                                            alt={user.ccaddress}
                                        />
                                        {user.username ?? 'anonymous'}
                                    </Box>
                                ))}
                            </Box>
                        }
                        placement="top"
                        disableHoverListener={props.reactUsers.length === 0}
                    >
                        <Box sx={{ display: 'flex' }}>
                            <IconButton
                                sx={{
                                    p: '0',
                                    color: 'text.secondary'
                                }}
                                color="primary"
                                onClick={() => {
                                    if (props.hasOwnReaction) {
                                        service.removeFavorite()
                                    } else {
                                        service.addFavorite()
                                    }
                                }}
                            >
                                {props.hasOwnReaction ? (
                                    <StarIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                ) : (
                                    <StarOutlineIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                )}
                            </IconButton>
                            <Typography sx={{ m: 'auto', size: '16px', fontSize: '13px' }}>
                                {props.message.associations.filter((e) => e.schema === Schemas.like).length}
                            </Typography>
                        </Box>
                    </Tooltip>
                    <IconButton
                        sx={{
                            p: '0',
                            color: 'text.secondary'
                        }}
                        onClick={(e) => {
                            setEmojiPickerAnchor(e.currentTarget)
                        }}
                    >
                        <AddReactionIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <IconButton
                        sx={{
                            p: '0',
                            color: 'text.secondary'
                        }}
                        onClick={(e) => {
                            setMenuAnchor(e.currentTarget)
                        }}
                    >
                        <MoreHorizIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                </Box>
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => {
                        setMenuAnchor(null)
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            const target: CCMessage<TypeSimpleNote> = props.message
                            navigator.clipboard.writeText(target.payload.body.body)
                            setMenuAnchor(null)
                        }}
                    >
                        <ListItemIcon>
                            <ContentPasteIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>ソースをコピー</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            service.openInspector()
                            setMenuAnchor(null)
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
                    anchorEl={emojiPickerAnchor}
                    open={Boolean(emojiPickerAnchor)}
                    onClose={() => {
                        setEmojiPickerAnchor(null)
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
                            setEmojiPickerAnchor(null)
                        }}
                        onMounted={() => {
                            repositionEmojiPicker.current?.updatePosition()
                        }}
                    />
                </Popover>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto' }}>
                    {props.msgstreams.map((e) => (
                        <Link
                            key={e.id}
                            underline="hover"
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            href={'/#' + e.id}
                        >
                            {`%${e.payload.body.shortname as string}`}
                        </Link>
                    ))}
                </Box>
                <Fade in={!streamListOpen}>
                    <Box sx={{ display: { sm: 'block', md: 'none' }, ml: 'auto', overFlow: 'hidden' }}>
                        {props.msgstreams.length === 1 && (
                            <Link
                                underline="hover"
                                sx={{
                                    fontweight: '400',
                                    fontSize: '12px',
                                    color: 'text.secondary'
                                }}
                                href={'/#' + props.msgstreams[0].id}
                            >
                                {`%${props.msgstreams[0].payload.body.shortname as string}`}
                            </Link>
                        )}
                    </Box>
                </Fade>
                {streamListOpen || (
                    <Box sx={{ display: { sm: 'block', md: 'none', whiteSpace: 'nowrap' } }}>
                        {props.msgstreams.length > 1 && (
                            <Link
                                onClick={() => {
                                    setStreamListOpen(true)
                                }}
                                underline="hover"
                                sx={{
                                    fontweight: '400',
                                    fontSize: '12px',
                                    color: 'text.secondary'
                                }}
                            >
                                {`%${props.msgstreams[0].payload.body.shortname as string}`} +
                                {props.msgstreams.length - 1}
                            </Link>
                        )}
                    </Box>
                )}
                <Fade in={streamListOpen} unmountOnExit>
                    <Box>
                        <IconButton
                            onClick={() => {
                                setStreamListOpen(false)
                            }}
                            sx={{
                                p: '0',
                                color: 'text.secondary',
                                display: { sm: 'block', md: 'none' }
                            }}
                        >
                            <ExpandCircleDownIcon
                                sx={{ fontSize: { transform: 'rotate(180deg)', xs: '70%', sm: '80%' } }}
                            />
                        </IconButton>
                    </Box>
                </Fade>
            </Box>
            <Collapse in={streamListOpen} collapsedSize={0}>
                <Box
                    sx={{
                        display: { sm: 'flex', md: 'none' },
                        gap: 0.5
                    }}
                >
                    {props.msgstreams.map((e) => (
                        <Link
                            key={e.id}
                            underline="hover"
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            href={'/#' + e.id}
                        >
                            {`%${e.payload.body.shortname as string}`}
                        </Link>
                    ))}
                </Box>
            </Collapse>
        </>
    )
}
