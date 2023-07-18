import { Box, Paper, Modal, Divider } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import {
    type CCID,
    Schemas,
    type RawReplyMessage,
    type RawReplyAssociation,
    type CoreMessage
} from '@concurrent-world/client'
import { ApplicationContext } from '../App'
import { Draft } from '../components/Draft'
import { MessageContainer } from '../components/Timeline/MessageContainer'

export interface MessageDetailState {
    showingMessage: { messageId: string; author: CCID } | null
    openAction: (mode: 'reply' | 'reroute', messageId: string, author: CCID) => void
}

const MessageDetailContext = createContext<MessageDetailState | undefined>(undefined)

interface MessageDetailProps {
    children: JSX.Element | JSX.Element[]
}

const style = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '700px',
    maxWidth: '90vw',
    p: 1
}

export const MessageDetailProvider = (props: MessageDetailProps): JSX.Element => {
    const client = useApi()
    const appData = useContext(ApplicationContext)
    const [showingMessage, showMessage] = useState<{ messageId: string; author: CCID } | null>(null)
    const [message, setMessage] = useState<CoreMessage<any> | undefined>()
    const [messageStreamWithoutHome, setMessageStreamWithoutHome] = useState<string[]>([])
    const [mode, setMode] = useState<'reply' | 'reroute' | 'none'>('none')

    const openAction = useCallback((mode: 'reply' | 'reroute', messageId: string, author: CCID) => {
        setMode(mode)
        showMessage({ messageId, author })
    }, [])

    useEffect(() => {
        console.log('MessageDetailProvider useEffect', showingMessage)
        if (!showingMessage?.messageId || !showingMessage.author) return

        client.api.readMessageWithAuthor(showingMessage.messageId, showingMessage.author).then((msg) => {
            setMessage(msg)
            if (!msg) return
            client.api.readCharacter(showingMessage.author, Schemas.userstreams).then((userstreams) => {
                setMessageStreamWithoutHome(
                    msg.streams.filter((e: string) => e !== userstreams?.payload.body.homeStream)
                )
            })
        })
    }, [showingMessage])

    const sendReply = async (replyText: string, messageStream: string[]): Promise<void> => {
        const data = await client.api.createMessage<RawReplyMessage>(
            Schemas.replyMessage,
            {
                replyToMessageId: message?.id || '',
                replyToMessageAuthor: message?.author || '',
                body: replyText
            },
            messageStream
        )

        const authorInbox = (await client.api.readCharacter(message?.author || '', Schemas.userstreams))?.payload.body
            .notificationStream
        const targetStream = [authorInbox, appData.user?.userstreams?.associationStream].filter((e) => e) as string[]

        console.log('assosiation', targetStream)

        await client.api.createAssociation<RawReplyAssociation>(
            Schemas.replyAssociation,
            { messageId: data.content.id, messageAuthor: client.ccid },
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
                    openAction
                }
            }, [])}
        >
            {props.children}

            {message && (
                <Modal
                    open={mode !== 'none'}
                    onClose={() => {
                        showMessage(null)
                        setMode('none')
                    }}
                >
                    <Paper sx={style}>
                        <MessageContainer messageID={message.id} messageOwner={message.author} />
                        <Divider />
                        <Box sx={{ display: 'flex' }}>
                            <Draft
                                autoFocus
                                allowEmpty={mode === 'reroute'}
                                submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                streamPickerInitial={messageStreamWithoutHome}
                                onSubmit={async (text, streams): Promise<Error | null> => {
                                    if (mode === 'reroute')
                                        await client.reroute(message.id, message.author, streams, text)
                                    else await handleReply(text, streams)
                                    setMode('none')
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
