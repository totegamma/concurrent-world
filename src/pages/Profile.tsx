import { Box, Divider, Typography, TextField, Button, useTheme } from '@mui/material'
import { useContext } from 'react'
import { ApplicationContext } from '../App'
import { usePersistent } from '../hooks/usePersistent'
import { Schemas } from '../schemas'
import { Sign } from '../util'

export function Profile (): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    const [username, setUsername] = usePersistent<string>('Username', 'anonymous')
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
            .then(async res => await res.json())
            .then(data => {
                console.log(data)
            // reload();
            })
    }

    return (<>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '20px', background: theme.palette.background.paper, minHeight: '100%' }}>
            <Typography variant="h5" gutterBottom>Profile</Typography>
            <Divider/>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '15px', gap: '5px' }}>
                <TextField label="username" variant="outlined" value={username} onChange={(e) => { setUsername(e.target.value) }}/>
                <TextField label="avatarURL" variant="outlined" value={avatar} onChange={(e) => { setAvatar(e.target.value) }}/>
                <Button variant="contained" onClick={_ => { updateProfile() }}>Update</Button>
            </Box>
            <Divider/>
            <Typography variant="h6" gutterBottom>Concurrent Address</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>
                {appData.userAddress}
            </Typography>
            <Typography variant="h6" gutterBottom>Publickey</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>
                {appData.publickey}
            </Typography>
            <Typography variant="h6" gutterBottom>Privatekey</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>
                {appData.privatekey}
            </Typography>
        </Box>
    </>)
}
