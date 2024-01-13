import { Box } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'

import {
    type RerouteMessageSchema,
    type Message,
    type ReplyMessageSchema,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { MessageView } from './MessageView'
import { OneLineMessageView } from './OneLineMessageView'
import { useEffect, useState } from 'react'
import { CCUserChip } from '../ui/CCUserChip'

export interface ReplyMessageFrameProp {
    message: Message<ReplyMessageSchema>
    lastUpdated?: number
    userCCID: string
    rerouted?: Message<RerouteMessageSchema>
    simple?: boolean
}

export const ReplyMessageFrame = (props: ReplyMessageFrameProp): JSX.Element => {
    const client = useApi()

    const [replyTo, setReplyTo] = useState<Message<SimpleNoteSchema | ReplyMessageSchema> | null>()

    useEffect(() => {
        if (props.message) {
            props.message.getReplyTo().then((msg) => {
                setReplyTo(msg)
            })
        }
    }, [props.message])

    return (
        <>
            {replyTo && <OneLineMessageView message={replyTo} />}
            <Box>
                <MessageView
                    simple={props.simple}
                    userCCID={client.ccid}
                    message={props.message}
                    beforeMessage={
                        <Box>
                            <CCUserChip
                                iconOverride={<ReplyIcon fontSize="small" />}
                                ccid={props.message.payload.body.replyToMessageAuthor}
                            />
                        </Box>
                    }
                    rerouted={props.rerouted}
                />
            </Box>
        </>
    )
}
