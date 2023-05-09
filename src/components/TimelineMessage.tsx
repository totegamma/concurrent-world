import { useState, useEffect, useContext } from 'react'
import {
    ListItem,
    Box,
    Avatar,
    Typography,
    Link,
    IconButton,
    Drawer,
    useTheme
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Sign } from '../util'

import BoringAvatar from 'boring-avatars'

import { ApplicationContext } from '../App'
import { type Emoji, type RTMMessage, type User } from '../model'
import { Schemas } from '../schemas'
import { MessageBody } from './MessageBody'

export interface TimelineMessageProps {
    message: string
    follow: (ccaddress: string) => void
}

const genEmojiTag = (emoji: Emoji): string => {
    return `<img src="${emoji.publicUrl}" alt="emoji:${emoji.name}:" title=":${emoji?.name}:"/>`
}

export function TimelineMessage(props: TimelineMessageProps): JSX.Element {
    const [user, setUser] = useState<User | null>()
    const [message, setMessage] = useState<RTMMessage | undefined>()
    const [msgstreams, setStreams] = useState<string>('')

    const appData = useContext(ApplicationContext)

    const theme = useTheme()

    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)

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
        loadTweet()
    }, [props.message])

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
            headers: {},
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
            headers: {},
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

    const messagebody = message
        ? JSON.parse(message.payload).body?.replace(
              /:\w+:/gi,
              (name: string) => {
                  const emoji: Emoji | undefined =
                      appData.emojiDict[name.slice(1, -1)]
                  if (emoji) {
                      return genEmojiTag(emoji)
                  }
                  return `${name}`
              }
          )
        : ''

    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                gap: { xs: '23px', sm: '25px' },
                p: { xs: '5px 0', sm: '10px 0' },
                wordBreak: 'break-word'
            }}
        >
            {message != null && (
                <>
                    <Box
                        sx={{
                            width: { xs: '32px', sm: '48px' }
                        }}
                    >
                        <IconButton
                            onClick={() => {
                                props.follow(message.author)
                            }}
                            sx={{
                                width: { xs: '56px', sm: '64px' },
                                height: { xs: '56px', sm: '64px' }
                            }}
                        >
                            {user?.avatar ? (
                                <Avatar
                                    alt="Profile Picture"
                                    src={user?.avatar}
                                    sx={{
                                        width: { xs: '40px', sm: '48px' },
                                        height: { xs: '40px', sm: '48px' }
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
                                    sx={{ fontWeight: '700' }}
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

                        <MessageBody messagebody={messagebody} />
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            {message.associations_data.find(
                                (e) => e.author === appData.userAddress
                            ) != null ? (
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    color="primary"
                                    onClick={() => {
                                        unfavorite(
                                            message?.id,
                                            message?.associations_data.find(
                                                (e) =>
                                                    e.author ===
                                                    appData.userAddress
                                            )?.id
                                        )
                                    }}
                                >
                                    <StarIcon />{' '}
                                    <Typography sx={{ size: '16px' }}>
                                        {
                                            message.associations_data.filter(
                                                (e) => e.schema === Schemas.like
                                            ).length
                                        }
                                    </Typography>
                                </IconButton>
                            ) : (
                                <IconButton
                                    sx={{
                                        p: '0',
                                        color: theme.palette.text.secondary
                                    }}
                                    onClick={() => {
                                        favorite(message?.id)
                                    }}
                                >
                                    <StarOutlineIcon />{' '}
                                    <Typography sx={{ size: '16px' }}>
                                        {
                                            message.associations_data.filter(
                                                (e) => e.schema === Schemas.like
                                            ).length
                                        }
                                    </Typography>
                                </IconButton>
                            )}
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
