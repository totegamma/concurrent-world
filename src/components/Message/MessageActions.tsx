import { Box, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { CCAvatar } from '../ui/CCAvatar'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RepeatIcon from '@mui/icons-material/Repeat'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { type M_Reply, type M_Current, type M_Reroute } from '@concurrent-world/client'
import { useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
import { useMessageService } from './MessageContainer'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { useEmojiPicker } from '../../context/EmojiPickerContext'
import { Link as RouterLink } from 'react-router-dom'
import { IconButtonWithNumber } from '../ui/IconButtonWithNumber'

export interface MessageActionsProps {
    message: M_Current | M_Reply | M_Reroute
    userCCID: string
}

export const MessageActions = (props: MessageActionsProps): JSX.Element => {
    const [streamListOpen, setStreamListOpen] = useState<boolean>(false)
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const service = useMessageService()

    const favorited = props.message.favorites.find((fav) => fav.author.ccid === props.userCCID)

    const replyCount = props.message.replies.length
    const likeCount = props.message.favorites.length
    const rerouteCount = props.message.reroutes.length

    const emojiPicker = useEmojiPicker()

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
                        gap: { xs: 1, sm: 4 }
                    }}
                >
                    {/* left */}
                    <IconButtonWithNumber
                        icon={<ReplyIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                        onClick={() => {
                            service?.openReply()
                        }}
                        message={replyCount}
                    />
                    <IconButtonWithNumber
                        icon={<RepeatIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                        onClick={() => {
                            service?.openReroute()
                        }}
                        message={rerouteCount}
                    />
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
                                {props.message.favorites.map((fav) => (
                                    <Box
                                        key={fav.author.ccid}
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
                                            avatarURL={fav.profileOverride?.avatar ?? fav.author.profile?.avatar}
                                            identiconSource={fav.author.ccid}
                                        />
                                        {fav.author.profile?.username ?? 'anonymous'}
                                    </Box>
                                ))}
                            </Box>
                        }
                        placement="top"
                        disableHoverListener={likeCount === 0}
                    >
                        <IconButtonWithNumber
                            icon={
                                favorited ? (
                                    <StarIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                ) : (
                                    <StarOutlineIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                )
                            }
                            onClick={() => {
                                if (favorited) {
                                    service?.removeFavorite()
                                } else {
                                    service?.addFavorite()
                                }
                            }}
                            message={likeCount}
                        />
                    </Tooltip>
                    <IconButtonWithNumber
                        icon={<AddReactionIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                        onClick={(e) => {
                            emojiPicker.open(e.currentTarget, (emoji) => {
                                console.log(emoji)
                                /*
                                if (emoji.src === undefined && emoji.unified) {
                                    emoji.src = `https://twemoji.maxcdn.com/v/latest/svg/${emoji.unified}.svg`
                                }
                                */
                                service?.addReaction(emoji.shortcode, emoji.imageURL)
                                emojiPicker.close()
                            })
                        }}
                        message={0}
                    />
                    <IconButtonWithNumber
                        icon={<MoreHorizIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                        onClick={(e) => {
                            setMenuAnchor(e.currentTarget)
                        }}
                        message={0}
                    />
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
                            props.message.body && navigator.clipboard.writeText(props.message.body)
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
                            service?.openInspector()
                            setMenuAnchor(null)
                        }}
                    >
                        <ListItemIcon>
                            <ManageSearchIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>詳細</ListItemText>
                    </MenuItem>
                    {service?.removeFromStream && props.message.author.ccid === props.userCCID && (
                        <MenuItem
                            onClick={() => {
                                service?.removeFromStream?.()
                            }}
                        >
                            <ListItemIcon>
                                <PlaylistRemoveIcon sx={{ color: 'text.primary' }} />
                            </ListItemIcon>
                            <ListItemText>このStreamから削除</ListItemText>
                        </MenuItem>
                    )}
                    {props.message.author.ccid === props.userCCID && (
                        <MenuItem
                            onClick={() => {
                                service?.deleteMessage()
                            }}
                        >
                            <ListItemIcon>
                                <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                            </ListItemIcon>
                            <ListItemText>メッセージを削除</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, ml: 'auto' }}>
                    {props.message.streams.map((e) => (
                        <Link
                            component={RouterLink}
                            key={e.id}
                            underline="hover"
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            to={'/stream#' + e.id}
                        >
                            {`%${e.shortname}`}
                        </Link>
                    ))}
                </Box>
                <Fade in={!streamListOpen}>
                    <Box sx={{ display: { sm: 'block', md: 'none' }, ml: 'auto', overFlow: 'hidden' }}>
                        {props.message.streams.length === 1 && (
                            <Link
                                component={RouterLink}
                                underline="hover"
                                sx={{
                                    fontweight: '400',
                                    fontSize: '12px',
                                    color: 'text.secondary'
                                }}
                                to={'/stream#' + props.message.streams[0].id}
                            >
                                {`%${props.message.streams[0].shortname}`}
                            </Link>
                        )}
                    </Box>
                </Fade>
                {streamListOpen || (
                    <Box sx={{ display: { sm: 'block', md: 'none', whiteSpace: 'nowrap' } }}>
                        {props.message.streams.length > 1 && (
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
                                {`%${props.message.streams[0].shortname}`} +{props.message.streams.length - 1}
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
                    {props.message.streams.map((e) => (
                        <Link
                            key={e.id}
                            underline="hover"
                            component={RouterLink}
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            to={'/stream#' + e.id}
                        >
                            {`%${e.shortname}`}
                        </Link>
                    ))}
                </Box>
            </Collapse>
        </>
    )
}
