import { Box, Divider, Paper, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { MessageContainer } from '../components/Message/MessageContainer'
import { InspectorProvider } from '../context/Inspector'
import { type CoreMessage, Schemas } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { ReplyTreeMessage } from '../components/Message/ReplyTreeMessage'

export function MessagePage(): JSX.Element {
    const { id } = useParams()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]
    const client = useApi()
    const [message, setMessage] = useState<CoreMessage<any> | undefined>()
    const [backwardMessageIdentity, setBackwardMessageIdentity] = useState<
        { messageID: string; messageOwner: string } | undefined
    >()
    const [forwardMessageIdentities, setForwardMessageIdentities] = useState<
        Array<{ messageID: string; messageOwner: string }>
    >([])
    // let message: CoreMessage<any> | undefined
    // let backwardMessageIdentity: {messageID: string, messageOwner: string} | undefined
    // let forwardMessageIdentities: Array<{messageID: string, messageOwner: string}> = new Array()

    useEffect(() => {
        client.api.readMessageWithAuthor(String(messageID), String(authorID)).then((msg: CoreMessage<any>) => {
            if (msg) setMessage(msg)
            // message = msg
        })
    }, [messageID, authorID])

    useEffect(() => {
        if (message) {
            if (message.payload.body.replyToMessageId) {
                setBackwardMessageIdentity({
                    messageID: message.payload.body.replyToMessageId,
                    messageOwner: message.payload.body.replyToMessageAuthor
                })
                // backwardMessageIdentity = {messageID: message.payload.body.replyToMessageId, messageOwner: message.payload.body.replyToMessageAuthor}
            } else if (message.associations.length > 0) {
                message.associations.map((a) => {
                    if (a.schema === Schemas.replyAssociation) {
                        setForwardMessageIdentities([
                            ...forwardMessageIdentities,
                            { messageID: a.payload.body.messageId, messageOwner: a.payload.body.messageAuthor }
                        ])
                        // forwardMessageIdentities = [...forwardMessageIdentities, {messageID: a.payload.body.messageId, messageOwner: a.payload.body.messageAuthor}]
                    }
                    return 0
                })
            }
        }
    }, [message])

    return (
        <InspectorProvider>
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
                {backwardMessageIdentity && (
                    <ReplyTreeMessage
                        messageID={backwardMessageIdentity.messageID}
                        messageOwner={backwardMessageIdentity.messageOwner}
                        isBackward={true}
                    />
                )}
                {messageID && authorID && (
                    <Paper
                        sx={{
                            padding: '20px'
                        }}
                    >
                        <MessageContainer messageID={messageID} messageOwner={authorID} />
                    </Paper>
                )}
                {forwardMessageIdentities.length > 0 &&
                    forwardMessageIdentities.map((forwardMessageIdentity) => (
                        <ReplyTreeMessage
                            key={forwardMessageIdentity.messageID}
                            messageID={forwardMessageIdentity.messageID}
                            messageOwner={forwardMessageIdentity.messageOwner}
                            isBackward={false}
                        />
                    ))}
            </Box>
        </InspectorProvider>
    )
}
