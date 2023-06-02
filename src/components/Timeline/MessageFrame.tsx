import { useState, useEffect, useCallback, memo } from 'react'
import {
    ListItem,
    Box,
    Typography,
    Link,
    IconButton,
    useTheme,
    Tooltip,
    Skeleton,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon
} from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'

import type { Character, Message as CCMessage, ProfileWithAddress, StreamElement, Stream } from '../../model'
import type { Profile } from '../../schemas/profile'
import { Schemas } from '../../schemas'
import { CCAvatar } from '../CCAvatar'
import { TimeDiff } from '../TimeDiff'
import type { Like } from '../../schemas/like'
import { useApi } from '../../context/api'
import { Multiplexer } from './Multiplexer'
import { useInspector } from '../../context/Inspector'
import type { SimpleNote } from '../../schemas/simpleNote'

export interface MessageFrameProp {
    message: StreamElement
    lastUpdated: number
}

export const MessageFrame = memo<MessageFrameProp>((props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [msgstreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const [fetchSuccess, setFetchSucceed] = useState<boolean>(true)

    useEffect(() => {
        api.fetchMessage(props.message.id, props.message.currenthost)
            .then((msg) => {
                if (!msg) return
                setMessage(msg)
                Promise.all(msg.streams.map(async (id) => await api.readStream(id))).then((e) => {
                    setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
                })
            })
            .catch((error) => {
                console.log(error)
                setFetchSucceed(false)
            })

        api.readCharacter(props.message.author, Schemas.profile, props.message.currenthost)
            .then((author) => {
                setAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [props.message, props.lastUpdated])

    useEffect(() => {
        const fetchUsers = async (): Promise<any> => {
            const authors = message?.associations.filter((e) => e.schema === Schemas.like).map((m) => m.author) ?? []

            if (message?.associations.find((e) => e.author === api.userAddress) != null) {
                setHasOwnReaction(true)
            } else {
                setHasOwnReaction(false)
            }
            const users = await Promise.all(
                authors.map((ccaddress) =>
                    api.readCharacter(ccaddress, Schemas.profile).then((e) => {
                        return {
                            ccaddress,
                            ...e?.payload.body
                        }
                    })
                )
            )
            setReactUsers(users)
        }

        fetchUsers()
    }, [message?.associations])

    const favorite = useCallback(async (): Promise<void> => {
        const targetStream = [
            (await api.readCharacter(props.message.author, Schemas.userstreams))?.payload.body.notificationStream
        ].filter((e) => e) as string[]

        console.log(targetStream)

        api.createAssociation<Like>(
            Schemas.like,
            {},
            props.message.id,
            'messages',
            targetStream,
            props.message.currenthost
        ).then((_) => {
            api.invalidateMessage(props.message.id)
        })
    }, [])

    const unfavorite = useCallback((deletekey: string | undefined): void => {
        if (!deletekey) return
        api.deleteAssociation(deletekey, props.message.currenthost).then((_) => {
            api.invalidateMessage(props.message.id)
        })
    }, [])

    if (!fetchSuccess) {
        return (
            <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                    404 not found
                </Typography>
            </ListItem>
        )
    }

    if (!message?.payload?.body) {
        return (
            <ListItem
                sx={{
                    alignItems: 'flex-start',
                    flex: 1,
                    p: { xs: '7px 0', sm: '10px 0' },
                    height: 105,
                    gap: '10px'
                }}
            >
                <Skeleton animation="wave" variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton animation="wave" />
                    <Skeleton animation="wave" height={80} />
                </Box>
            </ListItem>
        )
    }

    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                p: { xs: '7px 0', sm: '10px 0' },
                wordBreak: 'break-word'
            }}
        >
            {message?.payload?.body && (
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
                            to={'/entity/' + message.author}
                        >
                            <CCAvatar
                                alt={author?.payload.body.username}
                                avatarURL={author?.payload.body.avatar}
                                identiconSource={message.author}
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
                                    {author?.payload.body.username || 'anonymous'}
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
                                    {message.author}
                                </Typography>
                            </Box>
                            <Link component="button" underline="hover" color="inherit">
                                <TimeDiff date={new Date(message.cdate)} />
                            </Link>
                        </Box>
                        <Multiplexer body={message} />
                        <Box
                            sx={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: '20px' }}>
                                {/* left */}
                                <Tooltip
                                    title={
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1
                                            }}
                                        >
                                            {reactUsers.map((user) => (
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
                                    disableHoverListener={reactUsers.length === 0}
                                >
                                    <Box sx={{ display: 'flex' }}>
                                        <IconButton
                                            sx={{
                                                p: '0',
                                                color: theme.palette.text.secondary
                                            }}
                                            color="primary"
                                            onClick={() => {
                                                if (hasOwnReaction) {
                                                    unfavorite(
                                                        message.associations.find((e) => e.author === api.userAddress)
                                                            ?.id
                                                    )
                                                } else {
                                                    favorite()
                                                }
                                            }}
                                        >
                                            {hasOwnReaction ? <StarIcon /> : <StarOutlineIcon />}
                                        </IconButton>
                                        <Typography sx={{ size: '16px' }}>
                                            {message.associations.filter((e) => e.schema === Schemas.like).length}
                                        </Typography>
                                    </Box>
                                </Tooltip>
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    onClick={(e) => {
                                        setMessageAnchor(e.currentTarget)
                                    }}
                                >
                                    <MoreHorizIcon />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: '3px' }}>
                                {/* right */}
                                {msgstreams.map((e) => (
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
                anchorEl={messageAnchor}
                open={Boolean(messageAnchor)}
                onClose={() => {
                    setMessageAnchor(null)
                }}
            >
                <MenuItem
                    onClick={() => {
                        const target: CCMessage<SimpleNote> = message
                        navigator.clipboard.writeText(target.payload.body.body)
                        setMessageAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ContentPasteIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>ソースをコピー</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        inspector.inspectItem(props.message)
                        setMessageAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ManageSearchIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>詳細</ListItemText>
                </MenuItem>
                {props.message.author === api.userAddress && (
                    <MenuItem
                        onClick={() => {
                            api.deleteMessage(props.message.id)
                            api.invalidateMessage(props.message.id)
                            setFetchSucceed(false)
                            setMessageAnchor(null)
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
})

MessageFrame.displayName = 'MessageFrame'
