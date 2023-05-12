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
    const [avatar, setAvatar] = usePersistent<string>('AvatarURL', '')
    const [homeStream, SetHomeStream] = usePersistent<string>('homeStream', '')
    const [notificationStream, SetNotificationStream] = usePersistent<string>(
        'notificationStream',
        ''
    )

    const [showPrivateKey, setShowPrivateKey] = useState(false)

    const updateProfile = (): void => {
        const payloadObj = {
            username,
            avatar,
            description: '',
            home: homeStream,
            notification: notificationStream
        }

        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
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
                    minHeight: '100%',
                    overflow: 'scroll'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Identity
                </Typography>
                <Divider />
                <Typography variant="h3" gutterBottom>
                    Profile
                </Typography>
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
                    <TextField
                        label="HomeStream"
                        placeholder="home-username"
                        variant="outlined"
                        value={homeStream}
                        onChange={(e) => {
                            SetHomeStream(e.target.value)
                        }}
                    />
                    <TextField
                        label="NotificationStream"
                        placeholder="notification-username"
                        variant="outlined"
                        value={notificationStream}
                        onChange={(e) => {
                            SetNotificationStream(e.target.value)
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
