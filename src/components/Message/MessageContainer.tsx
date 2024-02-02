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
import { Box, type SxProps, Typography } from '@mui/material'
import { MessageView } from './MessageView'
import { usePreference } from '../../context/PreferenceContext'

interface MessageContainerProps {
    messageID: string
    messageOwner: string
    lastUpdated?: number
    after?: JSX.Element | undefined
    timestamp?: Date
    rerouted?: Message<RerouteMessageSchema>
    simple?: boolean
    sx?: SxProps
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const client = useApi()
    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [devMode] = usePreference('devMode')

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
            <Box sx={props.sx}>
                <MessageSkeleton />
                {props.after}
            </Box>
        )
    }

    if (!message) {
        if (devMode) {
            return (
                <>
                    <Typography>Message not found</Typography>
                    {props.messageID}@{props.messageOwner}
                    {props.after}
                </>
            )
        }
        return <></>
    }

    let body
    switch (message?.schema) {
        case Schemas.simpleNote:
            body = (
                <Box sx={props.sx}>
                    <MessageView
                        simple={props.simple}
                        message={message as Message<SimpleNoteSchema>}
                        lastUpdated={props.lastUpdated}
                        userCCID={client.ccid}
                        rerouted={props.rerouted}
                    />
                </Box>
            )
            break
        case Schemas.replyMessage:
            body = (
                <Box sx={props.sx}>
                    <ReplyMessageFrame
                        simple={props.simple}
                        message={message as Message<ReplyMessageSchema>}
                        lastUpdated={props.lastUpdated}
                        userCCID={client.ccid}
                        rerouted={props.rerouted}
                    />
                </Box>
            )
            break
        case Schemas.rerouteMessage:
            body = (
                <Box sx={props.sx}>
                    <RerouteMessageFrame
                        simple={props.simple}
                        message={message as Message<RerouteMessageSchema>}
                        lastUpdated={props.lastUpdated}
                    />
                </Box>
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
