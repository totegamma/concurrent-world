import { useState, useEffect, useCallback, memo } from 'react'
import { ListItem, Box, Typography, useTheme, Skeleton } from '@mui/material'

import type { Character, Message as CCMessage, ProfileWithAddress, Stream, CCID } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { useInspector } from '../../../context/Inspector'
import { MessageView } from './MessageView'
import { ThinMessageView } from './ThinMessageView'
import { OneLineMessageView } from './OneLineMessageView'
import { useMessageDetail } from '../../../context/MessageDetail'

export interface MessageFrameProp {
    message: CCMessage<any>
    lastUpdated: number
    variant?: 'default' | 'thin' | 'oneline'
}

export const MessageFrame = memo<MessageFrameProp>((props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const [fetchSuccess, setFetchSucceed] = useState<boolean>(true)

    useEffect(() => {
        setMessage(props.message)
        Promise.all(props.message.streams.map(async (id) => await api.readStream(id))).then((e) => {
            setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        })
        api.readCharacter(props.message.author, Schemas.profile)
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

            if (
                message?.associations
                    .filter((a) => a.schema === Schemas.like)
                    .find((e) => e.author === api.userAddress) != null
            ) {
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

    const reloadMessage = useCallback(async () => {
        try {
            console.log('reload message')
            const newMessage = await api.fetchMessageWithAuthor(props.message.id, props.message.author)
            setMessage(newMessage)
            setFetchSucceed(true)
        } catch (error) {
            setFetchSucceed(false)
        }
    }, [props.message.id, props.message.author])

    const unfavorite = useCallback(async (deletekey: string | undefined, author: CCID): Promise<void> => {
        if (!deletekey) return
        await api.unFavoriteMessage(deletekey, author)
        // 後々消す
        reloadMessage()
    }, [])

    if (!fetchSuccess) {
        return (
            <ListItem sx={{ display: 'flex', justifyContent: 'center' }} disablePadding disableGutters>
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

    switch (props.variant) {
        case 'thin':
            return (
                <ThinMessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {}}
                    handleReply={async () => {}}
                    unfavorite={() => {}}
                    favorite={async () => {}}
                    setMessageAnchor={setMessageAnchor}
                    setFetchSucceed={setFetchSucceed}
                />
            )
        case 'oneline':
            return (
                <OneLineMessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {}}
                    handleReply={async () => {}}
                    unfavorite={() => {}}
                    favorite={async () => {}}
                    setMessageAnchor={setMessageAnchor}
                    setFetchSucceed={setFetchSucceed}
                />
            )

        default:
            return (
                <MessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    emojiPickerAnchor={emojiPickerAnchor}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {
                        inspector.inspectItem({ messageId: message.id, author: message.author })
                    }}
                    handleReply={async () => {
                        messageDetail.openAction('reply', message?.id || '', message?.author || '')
                    }}
                    handleReRoute={async () => {
                        messageDetail.openAction('reroute', message.id, message?.author)
                    }}
                    unfavorite={() => {
                        unfavorite(message.associations.find((e) => e.author === api.userAddress)?.id, message.author)
                    }}
                    favorite={async () => {
                        await api.favoriteMessage(props.message.id, props.message.author)
                        // 後々消す
                        reloadMessage()
                    }}
                    addMessageReaction={async (emoji) => {
                        await api.addMessageReaction(
                            props.message.id,
                            props.message.author,
                            emoji.shortcodes,
                            emoji.src
                        )
                    }}
                    setMessageAnchor={setMessageAnchor}
                    setEmojiPickerAnchor={setEmojiPickerAnchor}
                    setFetchSucceed={setFetchSucceed}
                />
            )
    }
})

MessageFrame.displayName = 'MessageFrame'
