import type { M_Current, M_Reply, M_Reroute } from '@concurrent-world/client'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'

interface SimpleNoteProps {
    message: M_Current | M_Reply | M_Reroute
}

export const SimpleNote = (props: SimpleNoteProps): JSX.Element => {
    return <MarkdownRenderer messagebody={props.message.body ?? 'no content'} emojiDict={props.message.emojis ?? {}} />
}
