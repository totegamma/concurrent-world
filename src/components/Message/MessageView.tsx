import { Box } from '@mui/material'
import { SimpleNote } from './SimpleNote'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import { MessageUrlPreview } from './MessageUrlPreview'
import { type Message, type ReplyMessageSchema, type SimpleNoteSchema } from '@concurrent-world/client'
import { PostedStreams } from './PostedStreams'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'

export interface MessageViewProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema>
    userCCID: string
    beforeMessage?: JSX.Element
    lastUpdated?: number
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
    return (
        <ContentWithCCAvatar
            author={props.message.authorUser}
            profileOverride={props.message.payload.body.profileOverride}
        >
            <MessageHeader message={props.message} />
            {props.beforeMessage}
            <SimpleNote message={props.message} />
            <MessageUrlPreview messageBody={props.message.payload.body.body} />
            <MessageReactions message={props.message} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap'
                }}
            >
                <PostedStreams message={props.message} />
                <MessageActions message={props.message} userCCID={props.userCCID} />
            </Box>
        </ContentWithCCAvatar>
    )
}
