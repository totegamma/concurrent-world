import type { Message, SimpleNote as SimpleNoteSchema } from '@concurrent-world/client'
import { MarkdownRenderer } from '../MarkdownRenderer'

interface SimpleNoteProps {
    message: Message<SimpleNoteSchema>
}

export const SimpleNote = (props: SimpleNoteProps): JSX.Element => {
    return <MarkdownRenderer messagebody={props.message.payload.body.body} />
}
