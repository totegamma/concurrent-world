import { Box } from '@mui/material'
import { SimpleNote } from './SimpleNote'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import { MessageUrlPreview } from './MessageUrlPreview'
import {
    type RerouteMessageSchema,
    type Message,
    type ReplyMessageSchema,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { PostedStreams } from './PostedStreams'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ReplayIcon from '@mui/icons-material/Replay'

export interface MessageViewProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema>
    rerouted?: Message<RerouteMessageSchema>
    userCCID: string
    beforeMessage?: JSX.Element
    lastUpdated?: number
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
    const reroutedsame =
        props.rerouted &&
        props.rerouted.streams.length === props.message.streams.length &&
        props.rerouted.streams.every((v, i) => v === props.message.streams[i])

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
                <Box display="flex" flexDirection="row" alignItems="center">
                    <PostedStreams message={props.message} />
                    {props.rerouted &&
                        (reroutedsame ? (
                            <ReplayIcon color="secondary" sx={{ fontSize: '90%' }} />
                        ) : (
                            <>
                                <ArrowForwardIcon color="secondary" sx={{ fontSize: '90%' }} />
                                <PostedStreams message={props.rerouted} />
                            </>
                        ))}
                </Box>
                <MessageActions message={props.message} userCCID={props.userCCID} />
            </Box>
        </ContentWithCCAvatar>
    )
}
