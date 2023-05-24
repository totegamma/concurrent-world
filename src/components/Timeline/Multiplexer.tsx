import type { Message } from '../../model'
import { Schemas } from '../../schemas'
import { SimpleNote } from './SimpleNote'

interface MultiplexerProps {
    body: Message<any>
}

export const Multiplexer = (props: MultiplexerProps): JSX.Element => {
    switch (props.body.schema) {
        case Schemas.simpleNote:
            return <SimpleNote message={props.body} />
        default:
            return <>unknown schema: {props.body.schema}</>
    }
}
