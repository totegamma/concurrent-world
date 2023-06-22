import { Box, Paper, useTheme, Modal, TextField, Button, Divider } from '@mui/material'

import { createContext, type Dispatch, type SetStateAction, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import type { CCID, Message } from '../model'
import { Schemas } from '../schemas'
import { MessageFrame } from '../components/Timeline'
import { type ReplyMessage } from '../schemas/replyMessage'
import { type ReplyAssociation } from '../schemas/replyAssociation'
import { ApplicationContext } from '../App'
import { Draft } from '../components/Draft'

export interface MessageDetailState {
    showingMessage: { messageId: string; author: CCID } | null
    showMessage: Dispatch<SetStateAction<{ messageId: string; author: CCID } | null>>
    reRouteMessage: (messageId: string, author: CCID) => void
}

const MessageDetailContext = createContext<MessageDetailState | undefined>(undefined)

interface MessageDetailProps {
    children: JSX.Element | JSX.Element[]
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '700px',
    px: 2
}

export const MessageDetailProvider = (props: MessageDetailProps): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const [showingMessage, showMessage] = useState<{ messageId: string; author: CCID } | null>(null)
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [messageStreamWithoutHome, setMessageStreamWithoutHome] = useState<string[]>([])

    useEffect(() => {
        console.log('MessageDetailProvider useEffect', showingMessage)
        if (!showingMessage?.messageId || !showingMessage.author) return

        api.fetchMessageWithAuthor(showingMessage.messageId, showingMessage.author).then((msg) => {
            setMessage(msg)
            if (!msg) return
            api.readCharacter(showingMessage.author, Schemas.userstreams).then((userstreams) => {
                setMessageStreamWithoutHome(
                    msg.streams.filter((e: string) => e !== userstreams?.payload.body.homeStream)
                )
            })
        })
    }, [showingMessage])

    const reRouteMessage = async (messageId: string, author: CCID): Promise<void> => {
        console.log('reRouteMessage', messageId, author)
        const message = await api.fetchMessageWithAuthor(messageId, author)

        await api.reRouteMessage(messageId, author, [
            ...(message?.streams || []),
            appData.userstreams?.payload.body.homeStream || ''
        ])
    }

    const sendReply = async (replyText: string, messageStream: string[]): Promise<void> => {
        const data = await api?.createMessage<ReplyMessage>(
            Schemas.replyMessage,
            {
                replyToMessageId: message?.id || '',
                replyToMessageAuthor: message?.author || '',
                body: replyText
            },
            messageStream
        )

        const authorInbox = (await api.readCharacter(message?.author || '', Schemas.userstreams))?.payload.body
            .notificationStream
        const targetStream = [authorInbox, appData.userstreams?.payload.body.associationStream].filter(
            (e) => e
        ) as string[]

        console.log('assosiation', targetStream)

        await api?.createAssociation<ReplyAssociation>(
            Schemas.replyAssociation,
            { messageId: data.content.id, messageAuthor: api.userAddress },
            message?.id || '',
            message?.author || '',
            'messages',
            targetStream || []
        )
    }

    const handleReply = async (replyText: string, replyMessageStreams: string[]): Promise<void> => {
        if (!message) return
        if (!replyText) return
        await sendReply(replyText, replyMessageStreams)
        showMessage(null)
    }

    return (
        <MessageDetailContext.Provider
            value={useMemo(() => {
                return {
                    showingMessage,
                    showMessage,
                    reRouteMessage
                }
            }, [])}
        >
            {props.children}

            {message && (
                <Modal
                    open={!!showingMessage?.messageId}
                    onClose={() => {
                        showMessage(null)
                    }}
                >
                    <Paper sx={style}>
                        <MessageFrame message={message} lastUpdated={0}></MessageFrame>
                        <Divider />
                        <Box sx={{ display: 'flex' }}>
                            <Draft
                                submitButtonLabel="Reply"
                                streamPickerInitial={messageStreamWithoutHome}
                                onSubmit={async (text, streams): Promise<Error | null> => {
                                    handleReply(text, streams)
                                    return null
                                }}
                            />
                        </Box>
                    </Paper>
                </Modal>
            )}
        </MessageDetailContext.Provider>
    )
}

export function useMessageDetail(): MessageDetailState {
    return useContext(MessageDetailContext) as MessageDetailState
}
