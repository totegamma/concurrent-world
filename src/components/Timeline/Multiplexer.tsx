import { Schemas } from '../../schemas'
import type { Message as CCMessage, StreamElement } from '../../model'
import { useApi } from '../../context/api'
import { useEffect, useState } from 'react'
import { MessageFrame } from './MessageFrame/MessageFrame'
import { ReplyMessageFrame } from './MessageFrame/ReplyMessageFrame'

interface MultiplexerProps {
    message: StreamElement
    lastUpdated: number
}

export const MessageMultiplexer = (props: MultiplexerProps): JSX.Element => {
    const api = useApi()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()

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

    switch (message?.schema) {
        case Schemas.simpleNote:
            return (
                <MessageFrame
                    message={message}
                    currentHost={props.message.currenthost}
                    lastUpdated={props.lastUpdated}
                />
            )
        case Schemas.replyMessage:
            return (
                <ReplyMessageFrame
                    message={message}
                    currentHost={props.message.currenthost}
                    lastUpdated={props.lastUpdated}
                />
            )
        default:
            return <>unknown schema: {message?.schema}</>
    }
}
