import {
    Box,
    Divider,
    Typography,
    TextField,
    Button,
    IconButton,
    useTheme
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import { Schemas } from '../schemas'
import { Sign } from '../util'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { ProfileEditor } from '../components/ProfileEditor'

export function Identity(): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    const [showPrivateKey, setShowPrivateKey] = useState(false)

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
                <ProfileEditor />
                <Divider />
                <Typography variant="h3" gutterBottom>
                    Concurrent Address
                </Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {appData.userAddress}
                </Typography>
                <Typography variant="h3" gutterBottom>
                    Publickey
                </Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {appData.publickey}
                </Typography>
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
                    {showPrivateKey
                        ? appData.privatekey
                        : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                    <IconButton
                        sx={{ ml: 'auto' }}
                        onClick={() => {
                            setShowPrivateKey(!showPrivateKey)
                        }}
                    >
                        {!showPrivateKey ? (
                            <VisibilityIcon
                                sx={{ color: theme.palette.text.primary }}
                            />
                        ) : (
                            <VisibilityOffIcon
                                sx={{ color: theme.palette.text.primary }}
                            />
                        )}
                    </IconButton>
                </Typography>
            </Box>
        </>
    )
}
