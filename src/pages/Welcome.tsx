import { Box, Divider, Typography } from '@mui/material'

export function Welcome(): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                minHeight: '100%'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Welcome
            </Typography>
            <Divider />
        </Box>
    )
}
