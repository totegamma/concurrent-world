import { useState, useEffect, useContext } from 'react'
import {
    ListItem,
    Box,
    Avatar,
    Typography,
    Link,
    IconButton,
    Drawer,
    useTheme,
    Tooltip
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Sign } from '../util'

import BoringAvatar from 'boring-avatars'

import { ApplicationContext } from '../App'
import { type RTMMessage, type User } from '../model'
import { Schemas } from '../schemas'
import { MarkdownRenderer } from './MarkdownRenderer'

export interface TimelineMessageProps {
    message: string
    follow: (ccaddress: string) => void
    measure: any
    style: any
}

export function TimelineMessage(props: TimelineMessageProps): JSX.Element {
    const [user, setUser] = useState<User | null>()
    const [message, setMessage] = useState<RTMMessage | undefined>()
    const [msgstreams, setStreams] = useState<string>('')
    const [reactUsers, setReactUsers] = useState<User[]>([])

    const appData = useContext(ApplicationContext)

    const theme = useTheme()

    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const loadTweet = (): void => {
        appData.messageDict
            .get(props.message)
            .then((msg) => {
                setMessage(msg)
                appData.userDict
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
                                await appData.streamDict
                                    .get(id)
                                    .then((e) =>
                                        e.meta ? JSON.parse(e.meta).name : null
                                    )
                        )
                ).then((e) => {
                    setStreams(e.filter((x) => x).join(','))
                })
            })
            .catch((error) => {
                console.error(error)
            })
    }

    useEffect(() => {
        props.measure()
    }, [user, message])

    useEffect(() => {
        loadTweet()
    }, [props.message])

    useEffect(() => {
        const fetchUsers = async (): Promise<any> => {
            const authors =
                message?.associations_data
                    .filter((e) => e.schema === Schemas.like)
                    .map((m) => m.author) ?? []

            if (
                message?.associations_data.find(
                    (e) => e.author === appData.userAddress
                ) != null
            ) {
                setHasOwnReaction(true)
            } else {
                setHasOwnReaction(false)
            }
            const users = await Promise.all(
                authors.map((a) => appData.userDict.get(a))
            )
            setReactUsers(users)
        }

        fetchUsers()
    }, [message?.associations_data])

    const favorite = async (messageID: string | undefined): Promise<void> => {
        const favoriteScheme = Schemas.like
        if (!messageID) return
        const payloadObj = {}
        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)
        const targetAuthor = (await appData.messageDict.get(messageID)).author
        console.log(targetAuthor)
        const targetStream = (await appData.userDict.get(targetAuthor))
            .notificationstream
        console.log([targetStream].filter((e) => e))

        const requestOptions = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                author: appData.userAddress,
                schema: favoriteScheme,
                target: messageID,
                payload,
                signature,
                streams: [targetStream].filter((e) => e)
            })
        }

        fetch(appData.serverAddress + 'associations', requestOptions)
            .then(async (res) => await res.json())
            .then((_) => {
                appData.messageDict.invalidate(messageID)
                loadTweet()
            })
    }

    const unfavorite = (
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

        fetch(appData.serverAddress + 'associations', requestOptions)
            .then(async (res) => await res.json())
            .then((_) => {
                appData.messageDict.invalidate(messageID)
                loadTweet()
            })
    }

    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                p: { xs: '5px 0', sm: '10px 0' },
                wordBreak: 'break-word'
            }}
        >
            {message != null && (
                <>
                    <Box>
                        <IconButton
                            onClick={() => {
                                props.follow(message.author)
                            }}
                            sx={{
                                padding: {
                                    xs: '10px 8px 0 0',
                                    sm: '0 16px 0 0'
                                },
                                width: { xs: '40px', sm: '64px' },
                                height: { xs: '40px', sm: '64px' }
                            }}
                        >
                            {user?.avatar ? (
                                <Avatar
                                    alt="Profile Picture"
                                    src={user?.avatar}
                                    sx={{
                                        width: { xs: '32px', sm: '48px' },
                                        height: { xs: '32px', sm: '48px' }
                                    }}
                                />
                            ) : (
                                <BoringAvatar
                                    name={message.author}
                                    variant="beam"
                                    size={48}
                                />
                            )}
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            mt: '5px',
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
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {user?.username}{' '}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontweight: '400',
                                        fontSize: '10px',
                                        display: { xs: 'none', sm: 'inline' }
                                    }}
                                >
                                    {message.author} ·{' '}
                                </Typography>
                                <Link
                                    component="button"
                                    underline="hover"
                                    color="inherit"
                                >
                                    {new Date(message.cdate).toLocaleString()}
                                </Link>
                            </Box>
                            <Typography
                                component="span"
                                sx={{ fontWeight: '400' }}
                            >
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
                            </Typography>
                        </Box>
                        <MarkdownRenderer
                            messagebody={JSON.parse(message.payload).body}
                            measure={props.measure}
                            style={props.style}
                        />
                        <Box sx={{ display: 'flex', gap: '10px' }}>
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
                                                <Avatar
                                                    sx={{
                                                        height: '20px',
                                                        width: '20px'
                                                    }}
                                                    src={user.avatar}
                                                />
                                                {user.username}
                                            </Box>
                                        ))}
                                    </Box>
                                }
                                placement="top"
                                disableHoverListener={reactUsers.length === 0}
                            >
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    color="primary"
                                    onClick={() => {
                                        if (hasOwnReaction) {
                                            unfavorite(
                                                message?.id,
                                                message?.associations_data.find(
                                                    (e) =>
                                                        e.author ===
                                                        appData.userAddress
                                                )?.id
                                            )
                                        } else {
                                            favorite(message?.id)
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
                                                (e) => e.schema === Schemas.like
                                            ).length
                                        }
                                    </Typography>
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                onClick={() => {
                                    setInspectItem(message ?? null)
                                }}
                                sx={{
                                    p: '0',
                                    color: theme.palette.text.secondary
                                }}
                            >
                                <MoreHorizIcon />
                            </IconButton>
                        </Box>
                        <Drawer
                            anchor={'right'}
                            open={inspectItem != null}
                            onClose={() => {
                                setInspectItem(null)
                            }}
                            PaperProps={{
                                sx: {
                                    width: '40vw',
                                    borderRadius: '20px 0 0 20px',
                                    overflow: 'hidden',
                                    padding: '20px'
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    margin: 0,
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '13px'
                                }}
                            >
                                <Typography>ID: {inspectItem?.id}</Typography>
                                <Typography>
                                    Author: {inspectItem?.author}
                                </Typography>
                                <Typography>
                                    Schema: {inspectItem?.schema}
                                </Typography>
                                <Typography>
                                    Signature: {inspectItem?.signature}
                                </Typography>
                                <Typography>
                                    Created: {inspectItem?.cdate}
                                </Typography>
                                <Typography>Payload:</Typography>
                                <pre style={{ overflowX: 'scroll' }}>
                                    {JSON.stringify(
                                        JSON.parse(
                                            inspectItem?.payload ?? 'null'
                                        ),
                                        null,
                                        4
                                    ).replaceAll('\\n', '\n')}
                                </pre>
                                <Typography>
                                    Associations: {inspectItem?.associations}
                                </Typography>
                                <Typography>AssociationsData:</Typography>
                                <pre style={{ overflowX: 'scroll' }}>
                                    {JSON.stringify(
                                        inspectItem?.associations_data,
                                        null,
                                        4
                                    )}
                                </pre>
                            </Box>
                        </Drawer>
                    </Box>
                </>
            )}
        </ListItem>
    )
}
