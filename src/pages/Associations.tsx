import { Box, Divider, Typography, useTheme } from '@mui/material'

export function Associations(): JSX.Element {
    const theme = useTheme()

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                background: theme.palette.background.paper,
                minHeight: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography variant="h5" gutterBottom>
                Associations
            </Typography>
            <Divider />
        </Box>
    )
}
