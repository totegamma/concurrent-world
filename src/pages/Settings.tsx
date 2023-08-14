import { Divider, Typography, Box, Tabs, Tab } from '@mui/material'
import { APSettings } from '../components/Settings/APSettings'
import { GeneralSettings } from '../components/Settings/General'
import { ConcurrentSettings } from '../components/Settings/Concurrent'
import { useLocation } from 'react-router-dom'

type widgets = 'general' | 'concurrent' | 'activitypub'

export function Settings(): JSX.Element {
    const path = useLocation()
    const tab: widgets = (path.hash.replace('#', '') as widgets) || 'general'

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Settings
            </Typography>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, next) => {
                    window.location.hash = next
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab value="general" label="基本設定" />
                <Tab value="concurrent" label="アカウント詳細" />
                <Tab value="activitypub" label="Activitypub" />
            </Tabs>
            {tab === 'general' && <GeneralSettings />}
            {tab === 'concurrent' && <ConcurrentSettings />}
            {tab === 'activitypub' && <APSettings />}
        </Box>
    )
}
