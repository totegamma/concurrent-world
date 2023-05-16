import { useState } from 'react'
import { Divider, Tabs, Box, Tab, Typography } from '@mui/material'
import { StreamPicker } from './StreamPicker'
import { usePersistent } from '../hooks/usePersistent'

export function NavigatorSettings(): JSX.Element {
    const [tab, setTab] = useState(0)

    const [followStreams, setFollowStreams] = usePersistent<string[]>(
        'followStreams',
        []
    )
    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>(
        'defaultPostHome',
        []
    )
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>(
        'defaultPostNonHome',
        []
    )

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
                    <Divider />
                    <Typography variant="h3">ストリーム</Typography>
                    <StreamPicker
                        selected={followStreams}
                        setSelected={setFollowStreams}
                    />
                </Box>
            )}
            {tab === 1 && (
                <Box>
                    <Typography variant="h3">ホーム</Typography>
                    <StreamPicker
                        selected={defaultPostHome}
                        setSelected={setDefaultPostHome}
                    />
                    <Divider />
                    <Typography variant="h3">ホーム以外</Typography>
                    <StreamPicker
                        selected={defaultPostNonHome}
                        setSelected={setDefaultPostNonHome}
                    />
                </Box>
            )}
        </Box>
    )
}
