import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Schemas } from '../schemas'
import Button from '@mui/material/Button'
import type { Profile } from '../schemas/profile'
import { useApi } from '../context/api'
import type { Character } from '../model'

interface ProfileEditorProps {
    initial?: Character<Profile>
    onSubmit?: () => void
}

export function ProfileEditor(props: ProfileEditorProps): JSX.Element {
    const api = useApi()
    const [username, setUsername] = useState<string>(props.initial?.payload.body.username ?? '')
    const [avatar, setAvatar] = useState<string>(props.initial?.payload.body.avatar ?? '')

    const updateProfile = async (): Promise<void> => {
        api.upsertCharacter<Profile>(
            Schemas.profile,
            {
                username,
                avatar,
                description: ''
            },
            props.initial?.id
        ).then((data) => {
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
