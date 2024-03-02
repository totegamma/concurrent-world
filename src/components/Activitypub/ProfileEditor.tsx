import { useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { type ApEntity } from '../../model'
import { Box, Button, TextField, Typography, alpha, useTheme } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { useSnackbar } from 'notistack'
import { CCWallpaper } from '../ui/CCWallpaper'

export const ApProfileEditor = (props: { entity: ApEntity }): JSX.Element => {
    const { client } = useClient()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const [username, setUsername] = useState<string>('')
    const [avatar, setAvatar] = useState<string>('')
    const [description, setDescription] = useState<string>('')

    const updateProfile = (): void => {
        const requestOptions = {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: props.entity.id,
                name: username,
                summary: description,
                icon_url: avatar
            })
        }

        client.api
            .fetchWithCredential(client.api.host, `/ap/api/person`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                enqueueSnackbar('更新成功', {
                    variant: 'success'
                })
            })
            .catch((e) => {
                alert(e)
                enqueueSnackbar('更新失败', {
                    variant: 'error'
                })
            })
    }

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }
        client.api
            .fetchWithCredential(client.api.host, `/ap/api/person/${props.entity.id}`, requestOptions)
            .then(async (res) => await res.json())
            .then((profile) => {
                console.log('profile', profile)
                setUsername(profile?.content?.name ?? '')
                setAvatar(profile?.content?.icon_url ?? '')
                setDescription(profile?.content?.summary ?? '')
            })
    }, [props.entity])

    return (
        <CCWallpaper
            innerSx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                padding: 2
            }}
        >
            <CCAvatar
                avatarURL={avatar}
                identiconSource={client.ccid}
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
                    gap: 1,
                    flex: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    @{props.entity.id}@{client.host}
                </Typography>
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
                <Button
                    onClick={(_) => {
                        updateProfile()
                    }}
                >
                    更新
                </Button>
            </Box>
        </CCWallpaper>
    )
}
