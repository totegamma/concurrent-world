import { Box, Divider, Typography } from '@mui/material'
import { AckList } from '../components/AckList'
import { useApi } from '../context/api'

export function ContactsPage(): JSX.Element {
    const client = useApi()

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
                    Contacts
                </Typography>
                <Divider />
                {client.user && <AckList initmode={'acking'} user={client.user} />}
            </Box>
        </Box>
    )
}
