import { Box } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'

import {
    type RerouteMessageSchema,
    type Message,
    type ReplyMessageSchema,
    type MarkdownMessageSchema
} from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import { MessageView } from './MessageView'
import { OneLineMessageView } from './OneLineMessageView'
import { useEffect, useState } from 'react'
import { CCUserChip } from '../ui/CCUserChip'

export interface ReplyMessageFrameProp {
    message: Message<ReplyMessageSchema>
    lastUpdated?: number
    userCCID?: string
    rerouted?: Message<RerouteMessageSchema>
    simple?: boolean
}

export const ReplyMessageFrame = (props: ReplyMessageFrameProp): JSX.Element => {
    const { client } = useClient()

    const [replyTo, setReplyTo] = useState<Message<MarkdownMessageSchema | ReplyMessageSchema> | null>()

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
                                ccid={props.message.document.body.replyToMessageAuthor}
                                profileOverride={props.message.document.body.profileOverride}
                            />
                        </Box>
                    }
                    rerouted={props.rerouted}
                />
            </Box>
        </>
    )
}
