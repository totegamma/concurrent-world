import { Alert, AlertTitle, Box, Button, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { useSnackbar } from 'notistack'
import { Schemas } from '@concurrent-world/client'

import { useTranslation } from 'react-i18next'
import { useGlobalState } from '../../context/GlobalState'

export const ApSetup = (): JSX.Element => {
    const { client } = useClient()
    const { listedSubscriptions } = useGlobalState()
    const [userID, setUserID] = useState('')
    const { enqueueSnackbar } = useSnackbar()

    const [loading, setLoading] = useState<boolean>(false)
    const [entityFound, setEntityFound] = useState<boolean>(false)
    const [meta, setMeta] = useState<any>({})
    const proxyCCID = meta?.metadata?.proxyCCID

    const { t } = useTranslation('', { keyPrefix: 'settings.ap' })

    useEffect(() => {
        setLoading(true)
        if (!userID) return
        const timer = setTimeout(() => {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }
            client.api
                .fetchWithCredential(client.api.host, `/ap/api/entity?id=${userID}`, requestOptions)
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

    useEffect(() => {
        let mounted = true
        fetch(`https://${client.host}/ap/nodeinfo/2.0`)
            .then((res) => res.json())
            .then((res) => {
                if (!mounted) return
                setMeta(res)
            })
        return () => {
            mounted = false
        }
    }, [])

    const register = async (): Promise<void> => {
        if (!client?.ccid || !proxyCCID) {
            alert('program error')
            return
        }

        const followstream = await client.api.upsertTimeline(
            Schemas.communityTimeline,
            {
                name: 'ActivityPub',
                shortname: 'activitypub',
                description: 'ActivityPub home stream'
            },
            {
                semanticID: 'world.concrnt.t-ap',
                indexable: false,
                domainOwned: false,
                policy: 'https://policy.concrnt.world/t/inline-read-write.json',
                policyParams: JSON.stringify({
                    isWritePublic: false,
                    isReadPublic: true,
                    writer: [proxyCCID],
                    reader: []
                })
            }
        )

        client.api
            .subscribe('world.concrnt.t-ap@' + client.ccid, Object.keys(listedSubscriptions)[0])
            .then((subscription) => {
                console.log(subscription)
            })

        await client.api
            .fetchWithCredential(client.api.host, `/ap/api/entity`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    id: userID,
                    homestream: client?.user?.homeTimeline,
                    notificationstream: client?.user?.notificationTimeline,
                    followstream: followstream.id
                })
            })
            .then(async (res) => await res.json())
            .catch((e) => {
                enqueueSnackbar(`register entity failed: ${e}`, {
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
            <Typography>この操作により、ドメイン{client.host}にActivityPubのユーザーを登録します。</Typography>
            <Alert severity="warning">
                <AlertTitle>
                    Activitypubアカウントと紐づけるConcrntドメインは、慎重に選択する必要があります。
                </AlertTitle>
                Concrntアカウントの引っ越しに伴い、Activitypubアカウントも外部ドメインへ引っ越すことができますが、
                Concrntアカウントは自由に元のドメインに戻すことができる一方、Activitypub連携は仕様上
                <b>引っ越し元へ戻すことはできません</b>。
            </Alert>
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
