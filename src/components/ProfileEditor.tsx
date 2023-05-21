import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Sign } from '../util'
import { Schemas } from '../schemas'
import Button from '@mui/material/Button'
import type { Stream } from '../model'
import type { Profile } from '../schemas/profile'

interface ProfileEditorProps {
    initial: Profile
    userAddress: string
    privatekey: string
    serverAddress: string
    onSubmit?: () => void
}

export function ProfileEditor(props: ProfileEditorProps): JSX.Element {
    const [username, setUsername] = useState<string>(
        props.initial.username ?? ''
    )
    const [avatar, setAvatar] = useState<string>(props.initial.avatar ?? '')

    const updateProfile = async (): Promise<void> => {
        let homeStreamID = props.initial.homeStream
        if (homeStreamID === undefined || homeStreamID === '') {
            const payloadObj = {
                username: username + '-home'
            }

            const payload = JSON.stringify(payloadObj)
            const signature = Sign(props.privatekey, payload)

            const requestOptions = {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    author: props.userAddress,
                    maintainer: [props.userAddress],
                    writer: [props.userAddress],
                    reader: [],
                    schema: 'net.gammalab.concurrent.tbdStreamHomeMeta',
                    meta: payload,
                    signature
                })
            }

            homeStreamID = (
                await fetch(
                    props.serverAddress + 'stream',
                    requestOptions
                ).then(async (res) => (await res.json()) as Stream<any>)
            ).id
        }
        console.log('home', homeStreamID)

        let notificationStreamID = props.initial.notificationStream
        if (notificationStreamID === undefined || notificationStreamID === '') {
            const payloadObj = {
                username: username + '-notification'
            }

            const payload = JSON.stringify(payloadObj)
            const signature = Sign(props.privatekey, payload)

            const requestOptions = {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    author: props.userAddress,
                    maintainer: [props.userAddress],
                    writer: [],
                    reader: [props.userAddress],
                    schema: 'net.gammalab.concurrent.tbdStreamNotificationMeta',
                    meta: payload,
                    signature
                })
            }

            notificationStreamID = (
                await fetch(
                    props.serverAddress + 'stream',
                    requestOptions
                ).then(async (res) => (await res.json()) as Stream<any>)
            ).id
        }
        console.log('notification', notificationStreamID)

        const payloadObj = {
            username,
            avatar,
            description: '',
            home: homeStreamID,
            notification: notificationStreamID
        }

        const payload = JSON.stringify(payloadObj)
        const signature = Sign(props.privatekey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                author: props.userAddress,
                schema: Schemas.profile,
                payload,
                signature
            })
        }

        fetch(props.serverAddress + 'characters', requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                props.onSubmit?.()
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
