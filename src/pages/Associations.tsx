import { Box, Divider, Typography } from '@mui/material'
import { useContext } from 'react'
import { ApplicationContext } from '../App'
import { Timeline } from '../components/Timeline'

export function Associations(): JSX.Element {
    const appData = useContext(ApplicationContext)

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    padding: '20px 20px 0 20px'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Associations
                </Typography>
                <Divider />
            </Box>
            <Timeline streams={appData.displayingStream} />
        </Box>
    )
}
