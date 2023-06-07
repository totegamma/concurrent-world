import {
    Box,
    IconButton,
    Link,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    type Theme,
    Tooltip,
    Typography
} from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../CCAvatar'
import { TimeDiff } from '../TimeDiff'
import ReplyIcon from '@mui/icons-material/Reply'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import { Schemas } from '../../schemas'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream, StreamElement } from '../../model'
import { SimpleNote } from './SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../schemas/simpleNote'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import type { Profile } from '../../schemas/profile'
import type ConcurrentApiClient from '../../apiservice'
import type { InspectorState } from '../../context/Inspector'
import React from 'react'

export interface MessageViewProps {
    propsMessage: StreamElement
    message: CCMessage<TypeSimpleNote>
    author: Character<Profile> | undefined
    reactUsers: ProfileWithAddress[]
    theme: Theme
    hasOwnReaction: boolean
    msgstreams: Array<Stream<any>>
    messageAnchor: null | HTMLElement
    api: ConcurrentApiClient
    inspector: InspectorState
    handleReply: () => Promise<void>
    unfavorite: (deleteKey: string | undefined) => void
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
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '5px'
                                }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        fontWeight: '700',
                                        fontSize: {
                                            xs: '0.9rem',
                                            sm: '1rem'
                                        }
                                    }}
                                >
                                    {props.author?.payload.body.username || 'anonymous'}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontweight: '400',
                                        fontSize: '10px',
                                        display: {
                                            xs: 'none',
                                            sm: 'inline'
                                        }
                                    }}
                                >
                                    {props.message.author}
                                </Typography>
                            </Box>
                            <Link component="button" underline="hover" color="inherit">
                                <TimeDiff date={new Date(props.message.cdate)} />
                            </Link>
                        </Box>
                        {/* <Multiplexer body={props.message} /> */}
                        <SimpleNote message={props.message} />
                        <Box
                            sx={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: '20px' }}>
                                {/* left */}
                                <IconButton
                                    onClick={() => {
                                        props.handleReply()
                                    }}
                                >
                                    <ReplyIcon />
                                </IconButton>
                                <Tooltip
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
                                                color: props.theme.palette.text.secondary
                                            }}
                                            color="primary"
                                            onClick={() => {
                                                if (props.hasOwnReaction) {
                                                    props.unfavorite(
                                                        props.message.associations.find(
                                                            (e) => e.author === props.api.userAddress
                                                        )?.id
                                                    )
                                                } else {
                                                    props.favorite()
                                                }
                                            }}
                                        >
                                            {props.hasOwnReaction ? <StarIcon /> : <StarOutlineIcon />}
                                        </IconButton>
                                        <Typography sx={{ size: '16px' }}>
                                            {props.message.associations.filter((e) => e.schema === Schemas.like).length}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: props.theme.palette.text.secondary
                                    }}
                                    onClick={(e) => {
                                        props.setMessageAnchor(e.currentTarget)
                                    }}
                                >
                                    <MoreHorizIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: '3px' }}>
                                {/* right */}
                                {props.msgstreams.map((e) => (
                                    <Link
                                        key={e.id}
                                        underline="hover"
                                        sx={{
                                            fontweight: '400',
                                            fontSize: '13px',
                                            color: 'text.secondary'
                                        }}
                                        href={'/#' + e.id}
                                    >
                                        {`%${
                                            e.payload.body.name.length < 12
                                                ? (e.payload.body.name as string)
                                                : (e.payload.body.name.slice(0, 9) as string) + '...'
                                        }`}
                                    </Link>
                                ))}
                            </Box>
                        </Box>
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
                        props.inspector.inspectItem(props.propsMessage)
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
