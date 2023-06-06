import { memo, useState } from 'react'
import { Box, Divider, Grow, Tab, Tabs, Typography } from '@mui/material'
import { ServerJWT } from './ServerJWT'
import { UserJWT } from './UserJWT'
import { ActivityPub } from './ActivityPub'

export const Devtool = memo((): JSX.Element => {
    const [tab, setTab] = useState(0)

    return (
        <Box
            sx={{
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll',
                overflowX: 'hidden'
            }}
        >
            <Typography variant="h2">Devtool</Typography>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, index) => {
                    setTab(index)
                }}
            >
                <Tab label="ActivityPub" />
                <Tab label="ServerJWT" />
                <Tab label="UserJWT" />
            </Tabs>
            <Divider />
            <Box sx={{ position: 'relative', mt: '20px' }}>
                <Grow in={tab === 0} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <ActivityPub />
                    </Box>
                </Grow>
                <Grow in={tab === 1} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <ServerJWT />
                    </Box>
                </Grow>
                <Grow in={tab === 2} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <UserJWT />
                    </Box>
                </Grow>
            </Box>
        </Box>
    )
})

Devtool.displayName = 'Devtool'
