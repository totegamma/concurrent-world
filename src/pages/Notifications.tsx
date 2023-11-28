import { Box, Divider, Typography } from '@mui/material'
import { useContext } from 'react'
import { ApplicationContext } from '../App'
import { Timeline } from '../components/Timeline'
import { useTranslation } from 'react-i18next'

export function Notifications(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.notifications' })
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
                    {t('title')}
                </Typography>
                <Divider />
            </Box>

            <Timeline streams={appData.displayingStream} />
        </Box>
    )
}
