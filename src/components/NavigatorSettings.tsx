import { useState } from 'react'
import { Divider, Tabs, Box, Tab, Typography } from '@mui/material'

export function NavigatorSettings(): JSX.Element {
    const [tab, setTab] = useState(0)

    return (
        <Box>
            <Typography variant="h2">Navigator Settings</Typography>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, index) => {
                    setTab(index)
                }}
            >
                <Tab label="フォロー" />
                <Tab label="投稿先" />
            </Tabs>
            {tab === 0 && (
                <Box>
                    <Typography variant="h3">ユーザー</Typography>
                    <Typography variant="h3">ストリーム</Typography>
                </Box>
            )}
            {tab === 1 && (
                <Box>
                    <Typography variant="h3">ホーム</Typography>
                    <Typography variant="h3">ホーム以外</Typography>
                </Box>
            )}
        </Box>
    )
}
