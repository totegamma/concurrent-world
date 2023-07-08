import { Schemas } from '../../schemas'
import type { Message as CCMessage, StreamElement } from '../../model'
import { useApi } from '../../context/api'
import { useEffect, useState } from 'react'
import { MessageFrame } from './Message/MessageFrame'
import { ReplyMessageFrame } from './Message/ReplyMessageFrame'
import { type SimpleNote } from '../../schemas/simpleNote'
import { type ReplyMessage } from '../../schemas/replyMessage'
import { type ReRouteMessage } from '../../schemas/reRouteMessage'
import { ReRouteMessageFrame } from './Message/ReRouteMessageFrame'
import { MessageSkeleton } from '../MessageSkeleton'
import { Typography } from '@mui/material'

interface MultiplexerProps {
    message: StreamElement
    lastUpdated: number
    after: JSX.Element | undefined
}

export const MessageMultiplexer = (props: MultiplexerProps): JSX.Element | null => {
    const api = useApi()
    const [message, setMessage] = useState<CCMessage<SimpleNote | ReplyMessage | ReRouteMessage> | undefined>()
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        api.fetchMessage(props.message.id, props.message.currenthost)
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
    }, [props.message, props.lastUpdated])

    if (isFetching)
        return (
            <>
                <MessageSkeleton />
                {props.after}
            </>
        )

    if (!message) return null

    let body
    switch (message?.schema) {
        case Schemas.simpleNote:
            body = <MessageFrame message={message} lastUpdated={props.lastUpdated} />
            break
        case Schemas.replyMessage:
            body = <ReplyMessageFrame message={message} lastUpdated={props.lastUpdated} />
            break
        case Schemas.reRouteMessage:
            body = <ReRouteMessageFrame message={message} lastUpdated={props.lastUpdated} />
            break
        default:
            body = <Typography>unknown schema: {message?.schema}</Typography>
            break
    }

    return (
        <>
            {body}
            {props.after}
        </>
    )
}
