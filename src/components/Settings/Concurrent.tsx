import { Box, Button, Divider, IconButton, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { Passport } from '../../components/Passport'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useApi } from '../../context/api'

import Tilt from 'react-parallax-tilt'
import { IssueJWT } from '@concurrent-world/client'

export const ConcurrentSettings = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()
    const [showPrivateKey, setShowPrivateKey] = useState(false)

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    padding: { xs: '10px', sm: '10px 50px' }
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <Passport />
                </Tilt>
            </Box>
            <Divider />
            <Typography variant="h3" gutterBottom>
                CCID
            </Typography>
            <Typography>{client.ccid}</Typography>

            <Typography variant="h3" gutterBottom>
                Host
            </Typography>
            <Typography>{client.api.host}</Typography>

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
                {showPrivateKey ? client.api.privatekey : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                <IconButton
                    sx={{ ml: 'auto' }}
                    onClick={() => {
                        setShowPrivateKey(!showPrivateKey)
                    }}
                >
                    {!showPrivateKey ? (
                        <VisibilityIcon sx={{ color: 'text.primary' }} />
                    ) : (
                        <VisibilityOffIcon sx={{ color: 'text.primary' }} />
                    )}
                </IconButton>
            </Typography>
            <Button
                variant="contained"
                onClick={(_) => {
                    if (client.api.host === undefined) {
                        return
                    }
                    const jwt = IssueJWT(client.keyPair.privatekey, {
                        iss: client.ccid,
                        sub: client.domain,
                        exp: Math.floor((new Date().getTime() + 60 * 60 * 1000) / 1000).toString()
                    }) // 1h validity
                    window.location.href = `https://${client.api.host}/login?token=${jwt}`
                }}
            >
                Goto Domain Home
            </Button>
        </div>
    )
})

ConcurrentSettings.displayName = 'ConcurrentSettings'
