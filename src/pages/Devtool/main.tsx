import { memo, useState } from 'react'
import { Box, Divider, Fade, Tab, Tabs, Typography } from '@mui/material'
import { ServerJWT } from './ServerJWT'
import { UserJWT } from './UserJWT'
import { CCComposer } from './CCComposer'
import { IdentityGenerator } from './IdentityGenerator'

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
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label="Composer" />
                <Tab label="ServerJWT" />
                <Tab label="UserJWT" />
                <Tab label="IdentityGenerator" />
            </Tabs>
            <Divider />
            <Box sx={{ position: 'relative', mt: '20px' }}>
                <Fade in={tab === 0} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <CCComposer />
                    </Box>
                </Fade>
                <Fade in={tab === 1} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <ServerJWT />
                    </Box>
                </Fade>
                <Fade in={tab === 2} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <UserJWT />
                    </Box>
                </Fade>
                <Fade in={tab === 3} unmountOnExit>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
                        <IdentityGenerator />
                    </Box>
                </Fade>
            </Box>
        </Box>
    )
})

Devtool.displayName = 'Devtool'
