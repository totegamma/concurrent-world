import { Box, Paper, Modal, Divider } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import type { CCID, Message } from '../model'
import { Schemas } from '../schemas'
import type { ReplyMessage } from '../schemas/replyMessage'
import type { ReplyAssociation } from '../schemas/replyAssociation'
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
    p: 2
}

export const MessageDetailProvider = (props: MessageDetailProps): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const [showingMessage, showMessage] = useState<{ messageId: string; author: CCID } | null>(null)
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [messageStreamWithoutHome, setMessageStreamWithoutHome] = useState<string[]>([])
    const [mode, setMode] = useState<'reply' | 'reroute' | 'none'>('none')

    const openAction = useCallback((mode: 'reply' | 'reroute', messageId: string, author: CCID) => {
        setMode(mode)
        showMessage({ messageId, author })
    }, [])

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
                                        await api.reRouteMessage(message.id, message.author, streams, text)
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
