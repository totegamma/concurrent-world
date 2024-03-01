import { Box, Divider, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Timeline } from '../components/Timeline'
import { useClient } from '../context/ClientContext'

export function Associations(): JSX.Element {
    const { client } = useClient()

    const streams = useMemo(() => {
        const target = client.user?.userstreams?.payload.body.notificationStream
        return target ? [target] : []
    }, [client])

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
            <Timeline streams={streams} />
        </Box>
    )
}
