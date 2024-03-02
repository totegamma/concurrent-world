import { Box, Divider, Typography } from '@mui/material'
import { AckList } from '../components/AckList'
import { useClient } from '../context/ClientContext'
import { useTranslation } from 'react-i18next'

export function ContactsPage(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.contacts' })
    const { client } = useClient()

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
                    padding: '20px 20px 0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    {t('title')}
                </Typography>
                <Divider />
                {client.user && <AckList initmode={'acking'} user={client.user} />}
            </Box>
        </Box>
    )
}
