import { Box, Divider, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Timeline } from '../components/Timeline'
import { useTranslation } from 'react-i18next'
import { useClient } from '../context/ClientContext'

export function Notifications(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.notifications' })
    const { client } = useClient()

    const streams = useMemo(() => {
        const target = client.user?.notificationTimeline
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
                    paddingX: 1,
                    paddingTop: 1
                }}
            >
                <Typography variant="h2">{t('title')}</Typography>
                <Divider />
            </Box>
            <Timeline streams={streams} />
        </Box>
    )
}
