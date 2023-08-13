import { Schemas, type M_Current, type M_Reply, type M_Reroute } from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ReplyMessageFrame } from './ReplyMessageFrame'
import { RerouteMessageFrame } from './RerouteMessageFrame'
import { MessageSkeleton } from '../MessageSkeleton'
import { Typography } from '@mui/material'
import { useInspector } from '../../context/Inspector'
import { MessageView } from './MessageView'
import { useGlobalActions } from '../../context/GlobalActions'
import { usePreference } from '../../context/PreferenceContext'
import { useWatchingStream } from '../../context/WatchingStreamContext'

export interface MessageServiceState {
    addFavorite: () => void
    removeFavorite: () => void
    addReaction: (shortcode: string, img: string) => void
    removeReaction: (id: string) => void
    openInspector: () => void
    openReply: () => void
    openReroute: () => void
    deleteMessage: () => void
    removeFromStream?: () => void
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
    timestamp?: string
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const client = useApi()
    const pref = usePreference()
    const inspector = useInspector()
    const actions = useGlobalActions()
    const [message, setMessage] = useState<M_Current | M_Reroute | M_Reply | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const watchingStreams = useWatchingStream()

    const loadMessage = useCallback((): void => {
        client
            .getMessage(props.messageID, props.messageOwner)
            .then((msg) => {
                setMessage(msg)
            })
            .finally(() => {
                setIsFetching(false)
            })
    }, [props.messageID, props.messageOwner])

    const reloadMessage = useCallback((): void => {
        client.api.invalidateMessage(props.messageID)
        loadMessage()
    }, [client, props.messageID])

    const addFavorite = useCallback(async () => {
        if (!message) return
        await client.favorite(message)
        reloadMessage()
    }, [client, message])

    const removeFavorite = useCallback(async () => {
        if (!message) return
        await client.unFavorite(message)
        reloadMessage()
    }, [client, message])

    const deleteMessage = useCallback((): void => {
        if (!message) return
        client.deleteMessage(message).then(() => {
            reloadMessage()
        })
    }, [client, message])

    const addReaction = useCallback(
        (shortcode: string, img: string) => {
            if (!message) return
            client.addReaction(message, shortcode, img).then(() => {
                reloadMessage()
            })
        },
        [client, message]
    )

    const removeReaction = useCallback(
        (id: string) => {
            if (!message) return
            client.removeAssociation(message, id).then(() => {
                reloadMessage()
            })
        },
        [client, message]
    )

    const openInspector = useCallback(() => {
        if (!message) return
        inspector.inspectItem({ messageId: message.id, author: message.author.ccid })
    }, [inspector, message])

    const openReply = useCallback(() => {
        if (!message) return
        actions.openReply(message)
    }, [message, actions])

    const openReroute = useCallback(() => {
        if (!message) return
        actions.openReroute(message)
    }, [message, actions])

    const removeFromStream = useCallback(() => {
        if (!props.timestamp || !watchingStreams[0]) return
        client.api.removeFromStream(props.timestamp, watchingStreams[0])
    }, [client, props.timestamp, watchingStreams])

    useEffect(() => {
        loadMessage()
    }, [props.messageID, props.messageOwner, props.lastUpdated])

    const services = useMemo(() => {
        return {
            addFavorite,
            removeFavorite,
            addReaction,
            removeReaction,
            openInspector,
            openReply,
            openReroute,
            deleteMessage,
            removeFromStream: !props.timestamp || !watchingStreams[0] ? undefined : removeFromStream
        }
    }, [
        addFavorite,
        removeFavorite,
        addReaction,
        removeReaction,
        openInspector,
        openReply,
        openReroute,
        deleteMessage,
        removeFromStream,
        watchingStreams,
        removeFromStream
    ])

    if (isFetching) {
        return (
            <>
                <MessageSkeleton />
                {props.after}
            </>
        )
    }

    if (!message) {
        if (pref.devMode) {
            return (
                <>
                    <Typography>Message not found</Typography>
                    {props.messageID}@{props.messageOwner}
                    {props.after}
                </>
            )
        }
        return null
    }

    let body
    switch (message?.schema) {
        case Schemas.simpleNote:
            body = <MessageView message={message} lastUpdated={props.lastUpdated} userCCID={client.ccid} />
            break
        case Schemas.replyMessage:
            body = (
                <ReplyMessageFrame
                    message={message}
                    lastUpdated={props.lastUpdated}
                    reloadMessage={reloadMessage}
                    userCCID={client.ccid}
                />
            )
            break
        case Schemas.rerouteMessage:
            body = (
                <RerouteMessageFrame message={message} lastUpdated={props.lastUpdated} reloadMessage={reloadMessage} />
            )
            break
        default:
            body = <Typography>unknown schema: {(message as any).schema}</Typography>
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
