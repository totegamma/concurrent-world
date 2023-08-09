import { Box, Chip } from '@mui/material'

import { type M_Reply, type M_Current } from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { MessageView } from './MessageView'
import { OneLineMessageView } from './OneLineMessageView'

export interface ReplyMessageFrameProp {
    message: M_Reply
    reloadMessage: () => void
    lastUpdated?: number
    userCCID: string
}

export const ReplyMessageFrame = (props: ReplyMessageFrameProp): JSX.Element => {
    const client = useApi()

    return (
        <>
            {props.message.replyTarget && <OneLineMessageView message={props.message.replyTarget as M_Current} />}
            <Box>
                <MessageView
                    userCCID={client.ccid}
                    message={props.message}
                    beforeMessage={
                        <Chip
                            label={`@${props.message.replyTarget.author.profile?.username || 'anonymous'}`}
                            size="small"
                            sx={{ width: 'fit-content', mb: 1 }}
                        />
                    }
                />
            </Box>
        </>
    )
}
