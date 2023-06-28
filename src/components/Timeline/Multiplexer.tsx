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

interface MultiplexerProps {
    message: StreamElement
    lastUpdated: number
}

export const MessageMultiplexer = (props: MultiplexerProps): JSX.Element => {
    const api = useApi()
    const [message, setMessage] = useState<CCMessage<SimpleNote | ReplyMessage | ReRouteMessage> | undefined>()

    useEffect(() => {
        api.fetchMessage(props.message.id, props.message.currenthost)
            .then((msg) => {
                if (!msg) return
                setMessage(msg)
            })
            .catch((error) => {
                console.log(error)
            })
    }, [props.message, props.lastUpdated])

    if (!message) return <></>

    switch (message?.schema) {
        case Schemas.simpleNote:
            return <MessageFrame message={message} lastUpdated={props.lastUpdated} />
        case Schemas.replyMessage:
            return <ReplyMessageFrame message={message} lastUpdated={props.lastUpdated} />
        case Schemas.reRouteMessage:
            return <ReRouteMessageFrame message={message} lastUpdated={props.lastUpdated} />
        default:
            return <>unknown schema: {message?.schema}</>
    }
}
