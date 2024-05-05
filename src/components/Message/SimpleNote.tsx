import { type Message, type ReplyMessageSchema, type MarkdownMessageSchema } from '@concurrent-world/client'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'

interface SimpleNoteProps {
    message: Message<MarkdownMessageSchema | ReplyMessageSchema | ReplyMessageSchema>
}

export const SimpleNote = (props: SimpleNoteProps): JSX.Element => {
    return (
        <MarkdownRenderer
            messagebody={props.message.document.body.body ?? 'no content'}
            emojiDict={props.message.document.body.emojis ?? {}}
        />
    )
}
