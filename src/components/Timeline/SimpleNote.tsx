import type { Message } from '@concurrent-world/client'
import type { SimpleNote as SimpleNoteSchema } from '../../schemas/simpleNote'
import { MarkdownRenderer } from '../MarkdownRenderer'

interface SimpleNoteProps {
    message: Message<SimpleNoteSchema>
}

export const SimpleNote = (props: SimpleNoteProps): JSX.Element => {
    return <MarkdownRenderer messagebody={props.message.payload.body.body} />
}
