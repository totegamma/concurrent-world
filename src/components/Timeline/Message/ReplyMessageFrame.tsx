import { useState, useEffect } from 'react'
import { Box, Chip } from '@mui/material'

import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { MessageView } from './MessageView'
import { MessageFrame } from './MessageFrame'

export interface ReplyMessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated?: number
    author: Character<Profile> | undefined
    userCCID: string
    streams: Array<Stream<any>>
    favoriteUsers: ProfileWithAddress[]
    reactionUsers: ProfileWithAddress[]
}

export const ReplyMessageFrame = (props: ReplyMessageFrameProp): JSX.Element => {
    const api = useApi()
    const [replyMessage, setReplyMessage] = useState<CCMessage<any> | undefined>()
    const [replyMessageAuthor, setReplyMessageAuthor] = useState<Character<Profile> | undefined>()

    useEffect(() => {
        api.fetchMessageWithAuthor(
            props.message.payload.body.replyToMessageId,
            props.message.payload.body.replyToMessageAuthor
        ).then((msg) => {
            setReplyMessage(msg)
        })
    }, [props.message, props.lastUpdated])

    useEffect(() => {
        if (!replyMessage) return
        api.readCharacter(replyMessage.author, Schemas.profile)
            .then((author) => {
                setReplyMessageAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [replyMessage])

    return (
        <>
            {replyMessage && (
                <MessageFrame
                    message={replyMessage}
                    reloadMessage={props.reloadMessage}
                    variant="oneline"
                    author={replyMessageAuthor}
                    userCCID={api.userAddress}
                    streams={[]}
                    favoriteUsers={[]}
                    reactionUsers={[]}
                ></MessageFrame>
            )}
            <Box>
                <MessageView
                    userCCID={api.userAddress}
                    message={props.message}
                    author={props.author}
                    favoriteUsers={props.favoriteUsers}
                    reactionUsers={props.reactionUsers}
                    streams={props.streams}
                    beforeMessage={
                        <Chip
                            label={`@${replyMessageAuthor?.payload.body.username || 'anonymous'}`}
                            size="small"
                            sx={{ width: 'fit-content', mb: 1 }}
                        />
                    }
                />
            </Box>
        </>
    )
}
