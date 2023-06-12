import { Box, Divider, Typography, IconButton, useTheme, Tabs, Tab } from '@mui/material'
import { useState } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useApi } from '../context/api'
import { APSettings } from '../components/APSettings'
import { Passport } from '../components/Passport'

export function Identity(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
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
                        <Passport />
                        <Divider />
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
