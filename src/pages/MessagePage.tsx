import { Box, Divider, Paper, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { MessageContainer } from '../components/Message/MessageContainer'
import { InspectorProvider } from '../context/Inspector'

export function MessagePage(): JSX.Element {
    const { id } = useParams()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]

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
                {messageID && authorID && (
                    <Paper
                        sx={{
                            padding: '20px'
                        }}
                    >
                        <MessageContainer messageID={messageID} messageOwner={authorID} />
                    </Paper>
                )}
            </Box>
        </InspectorProvider>
    )
}
