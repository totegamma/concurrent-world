import { useState, useEffect, useCallback } from 'react'
import { Box, useTheme, Chip } from '@mui/material'

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
    reloadMessage: () => void
    lastUpdated: number
}

export const ReplyMessageFrame = (props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [replyMessage, setReplyMessage] = useState<CCMessage<any> | undefined>()
    const [replyMessageAuthor, setReplyMessageAuthor] = useState<Character<Profile> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [emojiUsers, setEmojiUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    useEffect(() => {
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
                props.message?.associations.filter((e) => e.schema === Schemas.emojiAssociation).map((m) => m.author) ??
                []

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
            const authors =
                props.message?.associations.filter((e) => e.schema === Schemas.like).map((m) => m.author) ?? []

            if (
                props.message?.associations
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
    }, [props.message?.associations, props.lastUpdated])

    const unfavorite = useCallback(async (deletekey: string | undefined, author: CCID): Promise<void> => {
        if (!deletekey) return
        await api.unFavoriteMessage(deletekey, author)
    }, [])

    if (!props.message?.payload?.body) return <MessageSkeleton />

    return (
        <>
            {replyMessage && (
                <MessageFrame
                    message={replyMessage}
                    lastUpdated={1}
                    variant="oneline"
                    reloadMessage={props.reloadMessage}
                ></MessageFrame>
            )}
            <Box>
                <MessageView
                    message={props.message}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {
                        inspector.inspectItem({ messageId: props.message.id, author: props.message.author })
                    }}
                    handleReply={async () => {
                        messageDetail.openAction('reply', props.message?.id || '', props.message?.author || '')
                    }}
                    handleReRoute={async () => {
                        messageDetail.openAction('reroute', props.message.id, props.message?.author)
                    }}
                    unfavorite={() => {
                        unfavorite(
                            props.message.associations.find((e) => e.author === api.userAddress)?.id,
                            props.message.author
                        )
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
                    beforeMessage={
                        <Chip
                            label={`@${replyMessageAuthor?.payload.body.username || 'anonymous'}`}
                            size="small"
                            sx={{ width: 'fit-content', mb: 1 }}
                        />
                    }
                    deleteMessage={() => {}}
                />
            </Box>
        </>
    )
}
