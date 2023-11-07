import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema
} from '@concurrent-world/client'
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
    openReply: () => void
    openReroute: () => void
    openInspector: () => void
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
    timestamp?: Date
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const client = useApi()
    const pref = usePreference()
    const inspector = useInspector()
    const actions = useGlobalActions()
    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const watchingStreams = useWatchingStream()

    const loadMessage = useCallback((): void => {
        client
            .getMessage<any>(props.messageID, props.messageOwner)
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

    const openInspector = useCallback(() => {
        if (!message) return
        inspector.inspectItem({ messageId: message.id, author: message.author })
    }, [inspector, message])

    const openReply = useCallback(() => {
        if (!message) return
        actions.openReply(message)
    }, [message, actions])

    const openReroute = useCallback(() => {
        if (!message) return
        actions.openReroute(message)
    }, [message, actions])

    useEffect(() => {
        loadMessage()
    }, [props.messageID, props.messageOwner, props.lastUpdated])

    const services = useMemo(() => {
        return {
            openReply,
            openReroute,
            openInspector
        }
    }, [openInspector, openReply, openReroute])

    if (isFetching) {
        return (
            <>
                <MessageSkeleton />
                {props.after}
            </>
        )
    }

    if (!message) {
        if (pref?.devMode) {
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
            body = (
                <MessageView
                    message={message as Message<SimpleNoteSchema>}
                    lastUpdated={props.lastUpdated}
                    userCCID={client.ccid}
                />
            )
            break
        case Schemas.replyMessage:
            body = (
                <ReplyMessageFrame
                    message={message as Message<ReplyMessageSchema>}
                    lastUpdated={props.lastUpdated}
                    userCCID={client.ccid}
                />
            )
            break
        case Schemas.rerouteMessage:
            body = (
                <RerouteMessageFrame
                    message={message as Message<RerouteMessageSchema>}
                    lastUpdated={props.lastUpdated}
                />
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
