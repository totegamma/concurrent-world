import { Divider, Typography, Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import { APSettings } from '../components/Settings/APSettings'
import { GeneralSettings } from '../components/Settings/General'
import { ConcurrentSettings } from '../components/Settings/Concurrent'

export function Settings(): JSX.Element {
    const [tab, setTab] = useState(0)

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
                onChange={(_, index) => {
                    setTab(index)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label="基本設定" />
                <Tab label="アカウント詳細" />
                <Tab label="Activitypub" />
            </Tabs>
            {tab === 0 && <GeneralSettings />}
            {tab === 1 && <ConcurrentSettings />}
            {tab === 2 && <APSettings />}
        </Box>
    )
}
