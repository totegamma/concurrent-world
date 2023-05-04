import {
    Box,
    Divider,
    Typography,
    TextField,
    Button,
    IconButton,
    useTheme
} from '@mui/material'
import { useContext, useState } from 'react'
import { ApplicationContext } from '../App'
import { usePersistent } from '../hooks/usePersistent'
import { Schemas } from '../schemas'
import { Sign } from '../util'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

export function Identity(): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    const [username, setUsername] = usePersistent<string>(
        'Username',
        'anonymous'
    )

    const [showPrivateKey, setShowPrivateKey] = useState(false)

    const [avatar, setAvatar] = usePersistent<string>('AvatarURL', '')

    const updateProfile = (): void => {
        const payloadObj = {
            username,
            avatar,
            description: ''
        }

        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: {},
            body: JSON.stringify({
                author: appData.userAddress,
                schema: Schemas.profile,
                payload,
                signature
            })
        }

        fetch(appData.serverAddress + 'characters', requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                // reload();
            })
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    padding: '20px',
                    background: theme.palette.background.paper,
                    minHeight: '100%'
                }}
            >
                <Typography variant="h5" gutterBottom>
                    Identity
                </Typography>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '15px',
                        gap: '5px'
                    }}
                >
                    <TextField
                        label="username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                        }}
                    />
                    <TextField
                        label="avatarURL"
                        variant="outlined"
                        value={avatar}
                        onChange={(e) => {
                            setAvatar(e.target.value)
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={(_) => {
                            updateProfile()
                        }}
                    >
                        Update
                    </Button>
                </Box>
                <Divider />
                <Typography variant="h6" gutterBottom>
                    Concurrent Address
                </Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {appData.userAddress}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Publickey
                </Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {appData.publickey}
                </Typography>
                <Typography variant="h6" gutterBottom>
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
                        : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                    <IconButton
                        sx={{ ml: 'auto' }}
                        onClick={() => {
                            setShowPrivateKey(!showPrivateKey)
                        }}
                    >
                        {!showPrivateKey ? (
                            <VisibilityIcon />
                        ) : (
                            <VisibilityOffIcon />
                        )}
                    </IconButton>
                </Typography>
            </Box>
        </>
    )
}
