import { Box, Button, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useApi } from '../../context/api'
import { useSnackbar } from 'notistack'
import { Schemas } from '@concurrent-world/client'
import { usePreference } from '../../context/PreferenceContext'

export const ApSetup = (): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const [userID, setUserID] = useState('')
    const { enqueueSnackbar } = useSnackbar()

    const [loading, setLoading] = useState<boolean>(false)
    const [entityFound, setEntityFound] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }
            client.api
                .fetchWithCredential(client.api.host, `/ap/api/person/${userID}`, requestOptions)
                .then(async (res) => await res.json())
                .then((profile) => {
                    console.log('profile', profile)
                    setEntityFound(true)
                })
                .catch((_e) => {
                    setEntityFound(false)
                })
                .finally(() => {
                    setLoading(false)
                })
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [userID])

    const register = async (): Promise<void> => {
        if (!client) {
            return
        }

        const followstream = await client.api.createStream(
            Schemas.commonstream,
            {
                name: 'ActivityPub',
                shortname: 'activitypub',
                description: 'ActivityPub home stream'
            },
            {
                reader: client?.user?.ccid ? [client?.user?.ccid] : [],
                visible: false
            }
        )

        const oldhome = pref.lists.home
        if (oldhome) {
            oldhome.streams.push(followstream.id)
            pref.updateList('home', oldhome)
        }

        await client.api
            .fetchWithCredential(client.api.host, `/ap/api/entity`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    id: userID,
                    homestream: client?.user?.userstreams?.homeStream,
                    notificationstream: client?.user?.userstreams?.notificationStream,
                    followstream: followstream.id
                })
            })
            .then(async (res) => await res.json())
            .catch((e) => {
                enqueueSnackbar(`register entity failed: ${e}`, {
                    variant: 'error'
                })
            })

        await client.api
            .fetchWithCredential(client.api.host, `/ap/api/person`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    id: userID,
                    name: client?.user?.profile?.username,
                    summary: client?.user?.profile?.description,
                    icon_url: client?.user?.profile?.avatar
                })
            })
            .then(async (res) => await res.json())
            .catch((e) => {
                enqueueSnackbar(`init profile failed: ${e}`, {
                    variant: 'error'
                })
            })

        window.location.reload()
    }

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography>
                ActivityPubにおけるIDを設定します。
                <br />
                一度登録すると変更できません
                <br />
            </Typography>
            <TextField
                label="UserID"
                value={userID}
                onChange={(x) => {
                    setUserID(x.target.value)
                }}
                error={userID.length > 0 && !userID.match(/^[a-zA-Z0-9_]+$/)}
                helperText={
                    userID.length > 0 && !userID.match(/^[a-zA-Z0-9_]+$/) ? 'a-z, A-Z, 0-9, _が使用できます' : ''
                }
            />
            {entityFound && (
                <Typography>
                    このユーザーは既に登録されています。
                    <br />
                    他のIDを試してください
                </Typography>
            )}
            <Button
                variant="contained"
                onClick={() => {
                    register()
                }}
                disabled={userID.length === 0 || !userID.match(/^[a-zA-Z0-9_]+$/) || entityFound || loading}
            >
                {loading ? '確認中...' : '登録'}
            </Button>
        </Box>
    )
}
