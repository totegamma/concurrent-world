import { Box, Paper, useTheme, Modal, TextField, Button } from '@mui/material'

import {
    createContext,
    type Dispatch,
    type SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { useApi } from './api'
import type { CCID, Message } from '../model'
import { Schemas } from '../schemas'
import { MessageFrame } from '../components/Timeline'
import SendIcon from '@mui/icons-material/Send'
import { type ReplyMessage } from '../schemas/replyMessage'
import { type ReplyAssociation } from '../schemas/replyAssociation'
import { ApplicationContext } from '../App'

export interface MessageDetailState {
    showingMessage: { messageId: string; author: CCID } | null
    showMessage: Dispatch<SetStateAction<{ messageId: string; author: CCID } | null>>
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
    const theme = useTheme()
    const appData = useContext(ApplicationContext)
    const [showingMessage, showMessage] = useState<{ messageId: string; author: CCID } | null>(null)
    const [message, setMessage] = useState<Message<any> | undefined>()
    const textFieldRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        console.log('MessageDetailProvider useEffect', showingMessage)
        if (!showingMessage?.messageId || !showingMessage.author) return

        api.fetchMessageWithAuthor(showingMessage.messageId, showingMessage.author).then((msg) => {
            setMessage(msg)
        })
    }, [showingMessage])

    const sendReply = async (replyText: string): Promise<void> => {
        console.log('messageId', message?.id)
        const data = await api?.createMessage<ReplyMessage>(
            Schemas.replyMessage,
            {
                replyToMessageId: message?.id || '',
                replyToMessageAuthor: message?.author || '',
                body: replyText
            },
            message?.streams || []
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

    const handleReply = async (): Promise<void> => {
        if (!message) return
        const replyText = textFieldRef.current?.value
        if (!replyText) return
        await sendReply(replyText)
        showMessage(null)
    }

    return (
        <MessageDetailContext.Provider
            value={useMemo(() => {
                return {
                    showingMessage,
                    showMessage
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
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Paper sx={style}>
                        <MessageFrame message={message} lastUpdated={0}></MessageFrame>
                        <Box sx={{ display: 'flex' }}>
                            <TextField id="outlined-basic" inputRef={textFieldRef} label="返信" variant="outlined" />
                            <Button
                                color="primary"
                                variant="contained"
                                // disabled={sending}
                                onClick={(_) => {
                                    handleReply()
                                }}
                                sx={{
                                    '&.Mui-disabled': {
                                        background: theme.palette.divider,
                                        color: theme.palette.text.disabled
                                    }
                                }}
                                endIcon={<SendIcon />}
                            >
                                Send
                            </Button>
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
