import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'
import { Schemas, type Character, type Profile } from '@concurrent-world/client'
import Button from '@mui/material/Button'
import { useApi } from '../context/api'
import { CCAvatar } from './CCAvatar'
import Background from '../resources/defaultbg.png'
import { alpha, useTheme } from '@mui/material'

interface ProfileEditorProps {
    initial?: Character<Profile>
    onSubmit?: (profile: Profile) => void
}

export function ProfileEditor(props: ProfileEditorProps): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const [username, setUsername] = useState<string>(props.initial?.payload.body.username ?? '')
    const [avatar, setAvatar] = useState<string>(props.initial?.payload.body.avatar ?? '')
    const [description, setDescription] = useState<string>(props.initial?.payload.body.description ?? '')
    const [banner, setBanner] = useState<string>(props.initial?.payload.body.banner ?? '')

    const updateProfile = async (): Promise<void> => {
        const profile = {
            username,
            avatar,
            description,
            banner
        }
        api.upsertCharacter<Profile>(Schemas.profile, profile, props.initial?.id).then((data) => {
            console.log(data)
            props.onSubmit?.(profile)
        })
    }

    useEffect(() => {
        setUsername(props.initial?.payload.body.username ?? '')
        setAvatar(props.initial?.payload.body.avatar ?? '')
        setDescription(props.initial?.payload.body.description ?? '')
        setBanner(props.initial?.payload.body.banner ?? '')
    }, [props.initial])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '15px',
                backgroundImage: `url(${banner || Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '15px'
            }}
        >
            <CCAvatar
                avatarURL={avatar}
                identiconSource={api.userAddress}
                sx={{
                    width: '64px',
                    height: '64px'
                }}
            />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '15px',
                    gap: '5px',
                    flex: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
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
                    label="description"
                    variant="outlined"
                    value={description}
                    multiline
                    onChange={(e) => {
                        setDescription(e.target.value)
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
                    label="bannerURL"
                    variant="outlined"
                    value={banner}
                    onChange={(e) => {
                        setBanner(e.target.value)
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
        </Box>
    )
}
