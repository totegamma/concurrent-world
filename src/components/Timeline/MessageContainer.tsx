import { Schemas } from '../../schemas'
import type { Character, Message, ProfileWithAddress, Stream } from '../../model'
import { useApi } from '../../context/api'
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ReplyMessageFrame } from './Message/ReplyMessageFrame'
import type { SimpleNote } from '../../schemas/simpleNote'
import type { ReplyMessage } from '../../schemas/replyMessage'
import type { ReRouteMessage } from '../../schemas/reRouteMessage'
import { ReRouteMessageFrame } from './Message/ReRouteMessageFrame'
import { MessageSkeleton } from '../MessageSkeleton'
import { Typography } from '@mui/material'
import { useInspector } from '../../context/Inspector'
import { useMessageDetail } from '../../context/MessageDetail'
import { type Profile } from '../../schemas/profile'
import { MessageView } from './Message/MessageView'

export interface MessageServiceState {
    addFavorite: () => void
    removeFavorite: () => void
    addReaction: (shortcode: string, img: string) => void
    removeReaction: (id: string) => void
    openInspector: () => void
    openReply: () => void
    openReroute: () => void
    deleteMessage: () => void
}

const MessageServiceContext = createContext<MessageServiceState | undefined>(undefined)

export function useMessageService(): MessageServiceState {
    return useContext(MessageServiceContext) as MessageServiceState
}

interface MessageContainerProps {
    messageID: string
    messageOwner: string
    lastUpdated?: number
    after?: JSX.Element | undefined
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [message, setMessage] = useState<Message<SimpleNote | ReplyMessage | ReRouteMessage> | undefined>()
    const [isFetching, setIsFetching] = useState<boolean>(false)

    const loadMessage = useCallback((): void => {
        api.fetchMessageWithAuthor(props.messageID, props.messageOwner)
            .then((msg) => {
                if (!msg) return
                setMessage(msg)
            })
            .catch((_e) => {
                setMessage(undefined)
            })
            .finally(() => {
                setIsFetching(false)
            })
    }, [props.messageID, props.messageOwner])

    const reloadMessage = useCallback((): void => {
        api.invalidateMessage(props.messageID)
        loadMessage()
    }, [api, props.messageID])

    const addFavorite = useCallback(async () => {
        if (!message) return
        await api.favoriteMessage(message.id, message.author)
        reloadMessage()
    }, [api, message])

    const removeFavorite = useCallback(async () => {
        const target = message?.associations.find((e) => e.author === api.userAddress && e.schema === Schemas.like)?.id
        if (!message || !target) return
        await api.unFavoriteMessage(target, message.author)
        reloadMessage()
    }, [api, message])

    const deleteMessage = useCallback((): void => {
        if (!message) return
        api.deleteMessage(message.id).then(() => {
            reloadMessage()
        })
    }, [api, message])

    const addReaction = useCallback(
        (shortcode: string, img: string) => {
            if (!message) return
            api.addMessageReaction(message.id, message.author, shortcode, img).then(() => {
                reloadMessage()
            })
        },
        [api, message]
    )

    const removeReaction = useCallback(
        (id: string) => {
            if (!message) return
            api.unFavoriteMessage(id, message.author).then(() => {
                reloadMessage()
            })
        },
        [api, message]
    )

    const openInspector = useCallback(() => {
        if (!message) return
        inspector.inspectItem({ messageId: message.id, author: message.author })
    }, [inspector, message])

    const openReply = useCallback(() => {
        if (!message) return
        messageDetail.openAction('reply', message.id, message.author)
    }, [message, messageDetail])

    const openReroute = useCallback(() => {
        if (!message) return
        messageDetail.openAction('reroute', message.id, message.author)
    }, [message, messageDetail])

    useEffect(() => {
        loadMessage()
    }, [props.messageID, props.messageOwner, props.lastUpdated])

    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [streams, setStreams] = useState<Array<Stream<any>>>([])
    const [favoriteUsers, setFavoriteUsers] = useState<ProfileWithAddress[]>([])
    const [reactionUsers, setReactionUsers] = useState<ProfileWithAddress[]>([])

    useEffect(() => {
        if (!message) return
        Promise.all(message.streams.map(async (id) => await api.readStream(id))).then((e) => {
            setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        })
        api.readCharacter(message.author, Schemas.profile)
            .then((author) => {
                setAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [message, props.lastUpdated])

    useEffect(() => {
        if (!message) return
        const fetchEmojiUsers = async (): Promise<any> => {
            const authors =
                message.associations.filter((e) => e.schema === Schemas.emojiAssociation).map((m) => m.author) ?? []

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
            setReactionUsers(users)
        }

        const fetchUsers = async (): Promise<any> => {
            const authors = message.associations.filter((e) => e.schema === Schemas.like).map((m) => m.author)

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
            setFavoriteUsers(users)
        }

        fetchUsers()
        fetchEmojiUsers()
    }, [message?.associations])

    const services = useMemo(() => {
        return {
            addFavorite,
            removeFavorite,
            addReaction,
            removeReaction,
            openInspector,
            openReply,
            openReroute,
            deleteMessage
        }
    }, [addFavorite, removeFavorite, addReaction, removeReaction, openInspector, openReply, openReroute, deleteMessage])

    if (isFetching) {
        return (
            <>
                <MessageSkeleton />
                {props.after}
            </>
        )
    }

    if (!message) return null

    let body
    switch (message?.schema) {
        case Schemas.simpleNote:
            body = (
                <MessageView
                    message={message as Message<SimpleNote>}
                    userCCID={api.userAddress}
                    author={author}
                    streams={streams}
                    favoriteUsers={favoriteUsers}
                    reactionUsers={reactionUsers}
                />
            )
            break
        case Schemas.replyMessage:
            body = (
                <ReplyMessageFrame
                    message={message as Message<ReplyMessage>}
                    lastUpdated={props.lastUpdated}
                    reloadMessage={reloadMessage}
                    author={author}
                    userCCID={api.userAddress}
                    streams={streams}
                    favoriteUsers={favoriteUsers}
                    reactionUsers={reactionUsers}
                />
            )
            break
        case Schemas.reRouteMessage:
            body = (
                <ReRouteMessageFrame
                    message={message as Message<ReRouteMessage>}
                    lastUpdated={props.lastUpdated}
                    reloadMessage={reloadMessage}
                />
            )
            break
        default:
            body = <Typography>unknown schema: {message?.schema}</Typography>
            break
    }

    return (
        <MessageServiceContext.Provider value={services}>
            {body}
            {props.after}
        </MessageServiceContext.Provider>
    )
})

MessageContainer.displayName = 'MessageContainer'
