import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { memo, useEffect, useState } from 'react'
import { ReplyMessageFrame } from './ReplyMessageFrame'
import { RerouteMessageFrame } from './RerouteMessageFrame'
import { MessageSkeleton } from '../MessageSkeleton'
import { Typography } from '@mui/material'
import { MessageView } from './MessageView'
import { usePreference } from '../../context/PreferenceContext'

interface MessageContainerProps {
    messageID: string
    messageOwner: string
    lastUpdated?: number
    after?: JSX.Element | undefined
    timestamp?: Date
    rerouted?: Message<RerouteMessageSchema>
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const client = useApi()
    const pref = usePreference()
    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)

    useEffect(() => {
        client
            .getMessage<any>(props.messageID, props.messageOwner)
            .then((msg) => {
                setMessage(msg)
            })
            .finally(() => {
                setIsFetching(false)
            })
    }, [props.messageID, props.messageOwner, props.lastUpdated])

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
                    rerouted={props.rerouted}
                />
            )
            break
        case Schemas.replyMessage:
            body = (
                <ReplyMessageFrame
                    message={message as Message<ReplyMessageSchema>}
                    lastUpdated={props.lastUpdated}
                    userCCID={client.ccid}
                    rerouted={props.rerouted}
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
        <>
            {body}
            {props.after}
        </>
    )
})

MessageContainer.displayName = 'MessageContainer'
