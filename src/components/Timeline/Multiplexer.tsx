import { Schemas } from '../../schemas'
import type { Message as CCMessage, StreamElement } from '../../model'
import { useApi } from '../../context/api'
import { useEffect, useState } from 'react'
import { MessageFrame } from './MessageFrame'

interface MultiplexerProps {
    message: StreamElement
    lastUpdated: number
}

export const MessageMultiplexer = (props: MultiplexerProps): JSX.Element => {
    const api = useApi()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()

    useEffect(() => {
        console.log('Multiplexer: ' + props.message.id)
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
            return <MessageFrame message={props.message} lastUpdated={props.lastUpdated} />
        case Schemas.replyMessage:
            return <h1>reply</h1>
        default:
            return <>unknown schema: {message?.schema}</>
    }
}
