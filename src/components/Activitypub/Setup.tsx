import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useApi } from '../../context/api'
import { useSnackbar } from 'notistack'
import { Schemas } from '@concurrent-world/client'
import { usePreference } from '../../context/PreferenceContext'

export const ApSetup = (): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const [userID, setUserID] = useState('')
    const { enqueueSnackbar } = useSnackbar()

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
            </Typography>
            <TextField
                label="UserID"
                value={userID}
                onChange={(x) => {
                    setUserID(x.target.value)
                }}
            />
            <Button
                variant="contained"
                onClick={() => {
                    register()
                }}
            >
                Setup
            </Button>
        </Box>
    )
}
