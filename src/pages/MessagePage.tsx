import { Box, Divider, Paper, Typography } from '@mui/material'
import { MessageFrame } from '../components/Timeline'
import { useApi } from '../context/api'
import { useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { type Message } from '../model'

export function MessagePage(): JSX.Element {
    const api = useApi()
    const { id } = useParams()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]

    const [message, setMessage] = useState<Message<any> | undefined>()

    const loadMessage = useCallback(() => {
        if (!messageID || !authorID) return
        api.fetchMessageWithAuthor(messageID, authorID).then((msg) => {
            if (!msg) return
            setMessage(msg)
        })
    }, [messageID, authorID])

    const reloadMessage = useCallback(() => {
        if (!messageID) return
        api.invalidateMessage(messageID)
        loadMessage()
    }, [messageID, loadMessage])

    useEffect(() => {
        loadMessage()
    }, [messageID, authorID])

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
            {message ? (
                <Paper sx={{ m: '10px 0', p: '0 20px' }} elevation={0} variant="outlined">
                    <MessageFrame message={message} lastUpdated={0} reloadMessage={reloadMessage} />
                </Paper>
            ) : (
                <Typography variant="body1" gutterBottom>
                    Loading...
                </Typography>
            )}
        </Box>
    )
}
