import { useState, useEffect, useCallback, memo } from 'react'
import {
    ListItem,
    Box,
    Typography,
    Link,
    IconButton,
    useTheme,
    Tooltip,
    Skeleton
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Sign, humanReadableTimeDiff } from '../util'

import type { Stream, RTMMessage, User } from '../model'
import { Schemas } from '../schemas'
import { MarkdownRenderer } from './MarkdownRenderer'
import { type IuseResourceManager } from '../hooks/useResourceManager'
import { CCAvatar } from './CCAvatar'

export interface TimelineMessageProps {
    message: string
    lastUpdated: number
    follow: (ccaddress: string) => void
    setInspectItem: (message: RTMMessage) => void
    messageDict: IuseResourceManager<RTMMessage>
    userDict: IuseResourceManager<User>
    streamDict: IuseResourceManager<Stream>
    userAddress: string
    privatekey: string
    serverAddress: string
}

export const TimelineMessage = memo<TimelineMessageProps>(
    (props: TimelineMessageProps): JSX.Element => {
        const [user, setUser] = useState<User | null>()
        const [message, setMessage] = useState<RTMMessage | undefined>()
        const [msgstreams, setStreams] = useState<string>('')
        const [reactUsers, setReactUsers] = useState<User[]>([])

        const theme = useTheme()

        const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

        useEffect(() => {
            props.messageDict
                .get(props.message)
                .then((msg) => {
                    setMessage(msg)
                    props.userDict
                        .get(msg.author)
                        .then((user) => {
                            setUser(user)
                        })
                        .catch((error) => {
                            console.error(error)
                        })

                    Promise.all(
                        msg.streams
                            .split(',')
                            .map(
                                async (id) =>
                                    await props.streamDict
                                        .get(id)
                                        .then((e) =>
                                            e.meta
                                                ? JSON.parse(e.meta).name
                                                : null
                                        )
                            )
                    ).then((e) => {
                        setStreams(e.filter((x) => x).join(','))
                    })
                })
                .catch((error) => {
                    console.error(error)
                })
        }, [props.message, props.lastUpdated])

        useEffect(() => {
            const fetchUsers = async (): Promise<any> => {
                const authors =
                    message?.associations_data
                        .filter((e) => e.schema === Schemas.like)
                        .map((m) => m.author) ?? []

                if (
                    message?.associations_data.find(
                        (e) => e.author === props.userAddress
                    ) != null
                ) {
                    setHasOwnReaction(true)
                } else {
                    setHasOwnReaction(false)
                }
                const users = await Promise.all(
                    authors.map((a) =>
                        props.userDict.get(a).then((e) =>
                            e.ccaddress
                                ? e
                                : {
                                      ccaddress: a,
                                      username: 'anonymous',
                                      avatar: '',
                                      description: '',
                                      homestream: '',
                                      notificationstream: ''
                                  }
                        )
                    )
                )
                setReactUsers(users)
            }

            fetchUsers()
        }, [message?.associations_data])

        const favorite = useCallback(
            async (messageID: string | undefined): Promise<void> => {
                const favoriteScheme = Schemas.like
                if (!messageID) return
                const payloadObj = {}
                const payload = JSON.stringify(payloadObj)
                const signature = Sign(props.privatekey, payload)
                const targetAuthor = (await props.messageDict.get(messageID))
                    .author
                const targetStream = (await props.userDict.get(targetAuthor))
                    .notificationstream

                const requestOptions = {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        author: props.userAddress,
                        schema: favoriteScheme,
                        target: messageID,
                        payload,
                        signature,
                        streams: [targetStream].filter((e) => e)
                    })
                }

                fetch(props.serverAddress + 'associations', requestOptions)
                    .then(async (res) => await res.json())
                    .then((_) => {
                        props.messageDict.invalidate(messageID)
                    })
            },
            [props.serverAddress, props.userAddress]
        )

        const unfavorite = useCallback(
            (
                messageID: string | undefined,
                deletekey: string | undefined
            ): void => {
                if (!messageID) return
                if (!unfavorite) return
                const requestOptions = {
                    method: 'DELETE',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        id: deletekey
                    })
                }

                fetch(props.serverAddress + 'associations', requestOptions)
                    .then(async (res) => await res.json())
                    .then((_) => {
                        props.messageDict.invalidate(messageID)
                    })
            },
            [props.serverAddress]
        )

        if (!message) {
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
                    <Skeleton
                        animation="wave"
                        variant="circular"
                        width={40}
                        height={40}
                    />
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
                {JSON.parse(message.payload).body && (
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
                                onClick={() => {
                                    props.follow(message.author)
                                }}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
                                }}
                            >
                                <CCAvatar
                                    alt={user?.username}
                                    avatarURL={user?.avatar}
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
                                <Box>
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
                                        {user?.username}{' '}
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
                                <Link
                                    component="button"
                                    underline="hover"
                                    color="inherit"
                                >
                                    {humanReadableTimeDiff(
                                        new Date(message.cdate)
                                    )}
                                </Link>
                            </Box>
                            <MarkdownRenderer
                                messagebody={JSON.parse(message.payload).body}
                            />
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: '10px',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box>
                                    {' '}
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
                                                            alignItems:
                                                                'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        <CCAvatar
                                                            sx={{
                                                                height: '20px',
                                                                width: '20px'
                                                            }}
                                                            avatarURL={
                                                                user.avatar
                                                            }
                                                            identiconSource={
                                                                user.ccaddress
                                                            }
                                                            alt={user.ccaddress}
                                                        />
                                                        {user.username}
                                                    </Box>
                                                ))}
                                            </Box>
                                        }
                                        placement="top"
                                        disableHoverListener={
                                            reactUsers.length === 0
                                        }
                                    >
                                        <IconButton
                                            sx={{
                                                p: '0',
                                                color: theme.palette.text
                                                    .secondary
                                            }}
                                            color="primary"
                                            onClick={() => {
                                                if (hasOwnReaction) {
                                                    unfavorite(
                                                        message.id,
                                                        message.associations_data.find(
                                                            (e) =>
                                                                e.author ===
                                                                props.userAddress
                                                        )?.id
                                                    )
                                                } else {
                                                    favorite(message.id)
                                                }
                                            }}
                                        >
                                            {hasOwnReaction ? (
                                                <StarIcon />
                                            ) : (
                                                <StarOutlineIcon />
                                            )}{' '}
                                            <Typography sx={{ size: '16px' }}>
                                                {
                                                    message.associations_data.filter(
                                                        (e) =>
                                                            e.schema ===
                                                            Schemas.like
                                                    ).length
                                                }
                                            </Typography>
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton
                                        onClick={() => {
                                            props.setInspectItem(
                                                message ?? null
                                            )
                                        }}
                                        sx={{
                                            p: '0',
                                            color: theme.palette.text.secondary
                                        }}
                                    >
                                        <MoreHorizIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    {' '}
                                    {/* right */}
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontweight: '400',
                                            fontSize: '13px',
                                            color: 'text.secondary'
                                        }}
                                    >
                                        %{msgstreams.replaceAll(',', ' %')}{' '}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </ListItem>
        )
    }
)

TimelineMessage.displayName = 'TimelineMessage'
