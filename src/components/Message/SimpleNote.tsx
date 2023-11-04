import { Message, ReplyMessageSchema, SimpleNoteSchema } from '@concurrent-world/client'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'

interface SimpleNoteProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema | ReplyMessageSchema>
}

export const SimpleNote = (props: SimpleNoteProps): JSX.Element => {
    return <MarkdownRenderer messagebody={props.message.payload.body.body ?? 'no content'} emojiDict={props.message.payload.body.emojis ?? {}} />
}
