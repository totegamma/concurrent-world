import { useState, useEffect, useCallback, memo } from 'react'
import { ListItem, Box, Typography, useTheme, Chip } from '@mui/material'

import type { Character, Message as CCMessage, ProfileWithAddress, Stream, CCID } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { useInspector } from '../../../context/Inspector'
import { MessageView } from './MessageView'
import { MessageFrame } from './MessageFrame'
import { useMessageDetail } from '../../../context/MessageDetail'
import { MessageSkeleton } from '../../MessageSkeleton'

export interface MessageFrameProp {
    message: CCMessage<any>
    lastUpdated: number
}

export const ReplyMessageFrame = memo<MessageFrameProp>((props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [replyMessage, setReplyMessage] = useState<CCMessage<any> | undefined>()
    const [replyMessageAuthor, setReplyMessageAuthor] = useState<Character<Profile> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [emojiUsers, setEmojiUsers] = useState<ProfileWithAddress[]>([])
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

        api.fetchMessageWithAuthor(
            props.message.payload.body.replyToMessageId,
            props.message.payload.body.replyToMessageAuthor
        ).then((msg) => {
            setReplyMessage(msg)
        })
    }, [props.message, props.lastUpdated])

    useEffect(() => {
        if (!replyMessage) return
        api.readCharacter(replyMessage.author, Schemas.profile)
            .then((author) => {
                setReplyMessageAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [replyMessage])

    useEffect(() => {
        // TODO: まとめてfetchする
        const fetchEmojiUsers = async (): Promise<any> => {
            const authors =
                message?.associations.filter((e) => e.schema === Schemas.emojiAssociation).map((m) => m.author) ?? []

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
            setEmojiUsers(users)
        }

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
        fetchEmojiUsers()
    }, [message?.associations, props.lastUpdated])

    const unfavorite = useCallback(async (deletekey: string | undefined, author: CCID): Promise<void> => {
        if (!deletekey) return
        await api.unFavoriteMessage(deletekey, author)
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

    if (!message?.payload?.body) return <MessageSkeleton />

    return (
        <>
            {replyMessage && <MessageFrame message={replyMessage} lastUpdated={1} variant="oneline"></MessageFrame>}
            <Box>
                <MessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
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
                    favorite={() => api.favoriteMessage(props.message.id, props.message.author)}
                    addMessageReaction={async (emoji) => {
                        await api.addMessageReaction(
                            props.message.id,
                            props.message.author,
                            emoji.shortcodes,
                            emoji.src
                        )
                    }}
                    removeMessageReaction={async (id) => {
                        await api.unFavoriteMessage(id, props.message.author)
                    }}
                    emojiPickerAnchor={emojiPickerAnchor}
                    setMessageAnchor={setMessageAnchor}
                    setEmojiPickerAnchor={setEmojiPickerAnchor}
                    setFetchSucceed={setFetchSucceed}
                    beforeMessage={
                        <Chip
                            label={`@${replyMessageAuthor?.payload.body.username || 'anonymous'}`}
                            size="small"
                            sx={{ width: 'fit-content', mb: 1 }}
                        />
                    }
                />
            </Box>
        </>
    )
})

ReplyMessageFrame.displayName = 'MessageFrame'
