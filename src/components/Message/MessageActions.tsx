import { Box, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { CCAvatar } from '../ui/CCAvatar'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RepeatIcon from '@mui/icons-material/Repeat'
import {
    type Association,
    type LikeSchema,
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { useMemo, useState } from 'react'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
// import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { useEmojiPicker } from '../../context/EmojiPickerContext'
import { Link as RouterLink } from 'react-router-dom'
import { IconButtonWithNumber } from '../ui/IconButtonWithNumber'
import { useGlobalActions } from '../../context/GlobalActions'
import { useInspector } from '../../context/Inspector'

export interface MessageActionsProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema>
    userCCID: string
}

export const MessageActions = (props: MessageActionsProps): JSX.Element => {
    const actions = useGlobalActions()
    const inspector = useInspector()

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const ownFavorite = useMemo(
        () => props.message.ownAssociations.find((association) => association.schema === Schemas.like),
        [props.message]
    )
    const [favoriteMembers, setFavoriteMembers] = useState<Array<Association<LikeSchema>>>([])

    const replyCount = props.message.associationCounts?.[Schemas.replyAssociation] ?? 0
    const likeCount = props.message.associationCounts?.[Schemas.like] ?? 0
    const rerouteCount = props.message.associationCounts?.[Schemas.rerouteAssociation] ?? 0

    const emojiPicker = useEmojiPicker()

    const loadFavoriteMembers = (): void => {
        props.message.getFavorites().then((favorites) => {
            setFavoriteMembers(favorites)
        })
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: '400px',
                    flex: 1
                }}
            >
                {/* left */}
                <IconButtonWithNumber
                    icon={<ReplyIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                    onClick={() => {
                        actions.openReply(props.message)
                    }}
                    message={replyCount}
                />
                <IconButtonWithNumber
                    icon={<RepeatIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                    onClick={() => {
                        actions.openReroute(props.message)
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
                            {favoriteMembers.map((fav) => (
                                <Box
                                    key={fav.author}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none'
                                    }}
                                    component={RouterLink}
                                    to={fav.payload.body.profileOverride?.link ?? '/entity/' + fav.author}
                                    target={fav.payload.body.profileOverride?.link ? '_blank' : undefined}
                                    rel={fav.payload.body.profileOverride?.link ? 'noopener noreferrer' : undefined}
                                >
                                    <CCAvatar
                                        sx={{
                                            height: '20px',
                                            width: '20px'
                                        }}
                                        avatarURL={
                                            fav.payload.body.profileOverride?.avatar ??
                                            fav.authorUser?.profile?.payload.body.avatar
                                        }
                                        identiconSource={fav.author}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            color: '#fff'
                                        }}
                                    >
                                        {fav.payload.body.profileOverride?.username ||
                                            fav.authorUser?.profile?.payload.body.username ||
                                            'anonymous'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    }
                    placement="top"
                    disableHoverListener={likeCount === 0}
                    onOpen={() => {
                        loadFavoriteMembers()
                    }}
                >
                    <IconButtonWithNumber
                        icon={
                            ownFavorite ? (
                                <StarIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                            ) : (
                                <StarOutlineIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                            )
                        }
                        onClick={() => {
                            if (ownFavorite) {
                                props.message.deleteAssociation(ownFavorite.id)
                            } else {
                                props.message.favorite()
                            }
                        }}
                        message={likeCount}
                    />
                </Tooltip>
                <IconButtonWithNumber
                    icon={<AddReactionIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />}
                    onClick={(e) => {
                        emojiPicker.open(e.currentTarget, (emoji) => {
                            props.message.reaction(emoji.shortcode, emoji.imageURL)
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
                        props.message.payload.body.body &&
                            navigator.clipboard.writeText(props.message.payload.body.body)
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
                        inspector.inspectItem({ messageId: props.message.id, author: props.message.author })
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ManageSearchIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>詳細</ListItemText>
                </MenuItem>
                {/*
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
                    */}
                {props.message.author === props.userCCID && (
                    <MenuItem
                        onClick={() => {
                            props.message.delete()
                        }}
                    >
                        <ListItemIcon>
                            <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>メッセージを削除</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </>
    )
}
