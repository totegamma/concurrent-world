import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import { Sign } from '../util'
import { Schemas } from '../schemas'
import Button from '@mui/material/Button'

export function ProfileEditor(): JSX.Element {
    const appData = useContext(ApplicationContext)
    const [username, setUsername] = useState<string>('anonymous')
    const [avatar, setAvatar] = useState<string>('')
    const [homeStream, SetHomeStream] = useState<string>('')
    const [notificationStream, SetNotificationStream] = useState<string>('')

    useEffect(() => {
        appData.userDict.get(appData.userAddress).then((e) => {
            setUsername(e.username)
            setAvatar(e.avatar)
            SetHomeStream(e.homestream)
            SetNotificationStream(e.notificationstream)
        })
    }, [])

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
                <Button
                    variant="contained"
                    onClick={(_) => {
                        updateProfile()
                    }}
                >
                    Update
                </Button>
            </Box>
        </>
    )
}
