import type { Message } from '../../model'
import { MarkdownRenderer } from '../MarkdownRenderer'
import type { ReplyMessage } from '../../schemas/replyMessage'
import { MessageFrame } from './MessageFrame'

interface ReplyNoteProps {
    message: Message<ReplyMessage>
}

export const ReplyNote = (props: ReplyNoteProps): JSX.Element => {
    // @ts-ignore
    return (<><MessageFrame message={{id: props.message.payload.body.replyToMessageId}}/>
            <MarkdownRenderer messagebody={props.message.payload.body.body} />
        </>
    )
}
