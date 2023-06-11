import { Box, Divider, Typography, IconButton, useTheme, Button, Tabs, Tab } from '@mui/material'
import { useContext, useState } from 'react'
import { ApplicationContext } from '../App'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { ProfileEditor } from '../components/ProfileEditor'
import { useApi } from '../context/api'
import { APSettings } from '../components/APSettings'

export function Identity(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const appData = useContext(ApplicationContext)
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [tab, setTab] = useState(0)

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    padding: '20px',
                    background: theme.palette.background.paper,
                    minHeight: '100%',
                    overflow: 'scroll'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Identity
                </Typography>
                <Divider />
                <Tabs
                    value={tab}
                    onChange={(_, index) => {
                        setTab(index)
                    }}
                >
                    <Tab label="Concurrent" />
                    <Tab label="ActivityPub" />
                </Tabs>
                {tab === 0 && (
                    <>
                        <ProfileEditor initial={appData.profile} />
                        <Divider />
                        <Typography variant="h3" gutterBottom>
                            Host
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-all' }}>{api.host?.fqdn}</Typography>
                        <Typography variant="h3" gutterBottom>
                            Home Stream
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-all' }}>
                            {appData.userstreams?.payload.body.homeStream}
                        </Typography>
                        <Typography variant="h3" gutterBottom>
                            Notification Stream
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-all' }}>
                            {appData.userstreams?.payload.body.notificationStream}
                        </Typography>
                        <Typography variant="h3" gutterBottom>
                            Association Stream
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-all' }}>
                            {appData.userstreams?.payload.body.associationStream}
                        </Typography>
                        <Typography variant="h3" gutterBottom>
                            Concurrent Address
                        </Typography>
                        <Typography sx={{ wordBreak: 'break-all' }}>{api.userAddress}</Typography>
                        <Typography variant="h3" gutterBottom>
                            Privatekey
                        </Typography>
                        <Typography
                            sx={{
                                wordBreak: 'break-all',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {showPrivateKey ? api.privatekey : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                            <IconButton
                                sx={{ ml: 'auto' }}
                                onClick={() => {
                                    setShowPrivateKey(!showPrivateKey)
                                }}
                            >
                                {!showPrivateKey ? (
                                    <VisibilityIcon sx={{ color: theme.palette.text.primary }} />
                                ) : (
                                    <VisibilityOffIcon sx={{ color: theme.palette.text.primary }} />
                                )}
                            </IconButton>
                        </Typography>
                    </>
                )}
                {tab === 1 && <APSettings />}
            </Box>
        </>
    )
}
