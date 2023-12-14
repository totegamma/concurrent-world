import { Box, Button, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useApi } from '../../context/api'
import { useSnackbar } from 'notistack'
import { Schemas } from '@concurrent-world/client'
import { usePreference } from '../../context/PreferenceContext'

import { useTranslation } from 'react-i18next'
import { type StreamList } from '../../model'

export const ApSetup = (): JSX.Element => {
    const client = useApi()
    const [lists, setLists] = usePreference('lists')
    const [userID, setUserID] = useState('')
    const { enqueueSnackbar } = useSnackbar()

    const [loading, setLoading] = useState<boolean>(false)
    const [entityFound, setEntityFound] = useState<boolean>(false)

    const { t } = useTranslation('', { keyPrefix: 'settings.ap' })

    const updateList = (id: string, list: StreamList): void => {
        const old = lists
        old[id] = list
        setLists(JSON.parse(JSON.stringify(old)))
    }

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

        const oldhome = lists.home
        if (oldhome) {
            oldhome.streams.push(followstream.id)
            updateList('home', oldhome)
        }

        await client.api
            .fetchWithCredential(client.api.host, `/ap/api/entity`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    id: userID,
                    homestream: client?.user?.userstreams?.payload.body.homeStream,
                    notificationstream: client?.user?.userstreams?.payload.body.notificationStream,
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
                    name: client?.user?.profile?.payload.body.username,
                    summary: client?.user?.profile?.payload.body.description,
                    icon_url: client?.user?.profile?.payload.body.avatar
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
                {t('setup')}
                <br />
                {t('cantBeChangedOnceRegistered')}
                <br />
            </Typography>
            <TextField
                label="UserID"
                value={userID}
                onChange={(x) => {
                    setUserID(x.target.value)
                }}
                error={userID.length > 0 && !userID.match(/^[a-zA-Z0-9_]+$/)}
                helperText={userID.length > 0 && !userID.match(/^[a-zA-Z0-9_]+$/) ? t('helperText') : ''}
            />
            {entityFound && (
                <Typography>
                    {t('alreadyRegistered')}
                    <br />
                    {t('tryAnotherID')}
                </Typography>
            )}
            <Button
                onClick={() => {
                    register()
                }}
                disabled={userID.length === 0 || !userID.match(/^[a-zA-Z0-9_]+$/) || entityFound || loading}
            >
                {loading ? t('confirming') : t('register')}
            </Button>
        </Box>
    )
}
