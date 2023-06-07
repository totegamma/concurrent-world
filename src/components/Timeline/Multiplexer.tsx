import type { Message } from '../../model'
import { Schemas } from '../../schemas'
import { SimpleNote } from './SimpleNote'
import { ReplyNote } from './ReplyNote'

interface MultiplexerProps {
    body: Message<any>
}

export const Multiplexer = (props: MultiplexerProps): JSX.Element => {
    switch (props.body.schema) {
        case Schemas.simpleNote:
            // return <MessageFrame message={props.message} lastUpdated={props.lastUpdated} />
            return <SimpleNote message={props.body} />
        case Schemas.replyMessage:
            return <ReplyNote message={props.body} />
        default:
            return <>unknown schema: {props.body.schema}</>
    }
}
