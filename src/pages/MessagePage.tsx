import { Box, Divider, Paper, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import { useEffect, useState } from 'react'
import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { MessageView } from '../components/Message/MessageView'
import { Draft } from '../components/Draft'
import { useGlobalActions } from '../context/GlobalActions'

export function MessagePage(): JSX.Element {
    const { id } = useParams()
    const client = useApi()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]
    const lastUpdated = 0

    const actions = useGlobalActions()

    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const [replies, setReplies] = useState<Array<Message<ReplyMessageSchema>>>([])
    const [replyTo, setReplyTo] = useState<Message<ReplyMessageSchema> | null>(null)

    useEffect(() => {
        setMessage(null)
        setReplies([])
        setReplyTo(null)

        let isMounted = true
        console.log('loadMessage', messageID, authorID)
        if (!messageID || !authorID) return
        client
            .getMessage<any>(messageID, authorID)
            .then((msg) => {
                if (!isMounted || !msg) return
                setMessage(msg)

                msg.getReplyMessages().then((replies) => {
                    if (!isMounted) return
                    setReplies(replies)
                })

                if (msg.schema === Schemas.replyMessage) {
                    msg.getReplyTo().then((replyTo) => {
                        if (!isMounted) return
                        setReplyTo(replyTo)
                    })
                }
            })
            .finally(() => {
                setIsFetching(false)
            })

        return () => {
            isMounted = false
        }
    }, [messageID, authorID])

    if (isFetching) {
        return (
            <>
                <Typography>loading...</Typography>
            </>
        )
    }

    if (!message) {
        return (
            <>
                <Typography>Message not found</Typography>
            </>
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Message
            </Typography>
            <Divider />

            {replyTo && (
                <Paper
                    sx={{
                        padding: '20px'
                    }}
                >
                    <MessageView message={replyTo} lastUpdated={lastUpdated} userCCID={client.ccid} />
                </Paper>
            )}

            {(message.schema === Schemas.simpleNote || message.schema === Schemas.replyMessage) && (
                <Paper
                    sx={{
                        padding: '20px'
                    }}
                >
                    <MessageView
                        message={message as Message<SimpleNoteSchema | ReplyMessageSchema>}
                        lastUpdated={lastUpdated}
                        userCCID={client.ccid}
                    />
                </Paper>
            )}
            <Paper
                variant="outlined"
                sx={{
                    padding: 1
                }}
            >
                <Draft
                    streamPickerInitial={message.postedStreams ?? []}
                    streamPickerOptions={actions.allKnownStreams}
                    placeholder="Write a reply..."
                    onSubmit={async (text: string, streams: string[], emojis) => {
                        message.reply(streams, text, emojis)
                        return null
                    }}
                />
            </Paper>
            {replies.length > 0 && (
                <>
                    <Typography variant="h2" gutterBottom>
                        Replies:
                    </Typography>
                    {replies.map((reply) => (
                        <Paper
                            key={reply.id}
                            sx={{
                                padding: '20px'
                            }}
                        >
                            <MessageView message={reply} lastUpdated={lastUpdated} userCCID={client.ccid} />
                        </Paper>
                    ))}
                </>
            )}
        </Box>
    )
}
