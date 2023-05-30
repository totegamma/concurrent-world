import { Box, Divider, Typography } from '@mui/material'

export function MessagePage(): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                background: 'background.paper',
                minHeight: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Message
            </Typography>
            <Divider />
        </Box>
    )
}
