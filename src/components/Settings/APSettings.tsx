import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { useApi } from '../../context/api'
import { type ApEntity } from '../../model'
import { ApSetup } from '../Activitypub/Setup'
import { ApProfileEditor } from '../Activitypub/ProfileEditor'
import { ApFollowManager } from '../Activitypub/FollowManager'
import { AddListButton } from '../AddListButton'

export const APSettings = (): JSX.Element => {
    const client = useApi()
    const [entity, setEntity] = useState<ApEntity | null | undefined>(undefined)

    useEffect(() => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }

        client.api
            .fetchWithCredential(client.api.host, `/ap/api/entity/${client.ccid}`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setEntity(data.content)
            })
            .catch((e) => {
                console.log(e)
                setEntity(null)
            })
    }, [])

    if (entity === undefined) {
        return <>loading...</>
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}
        >
            {entity === null ? (
                <ApSetup />
            ) : (
                <>
                    <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={1} width="100%">
                        <AddListButton stream={entity.followstream} />
                    </Box>
                    <ApProfileEditor entity={entity} />
                    <ApFollowManager />
                </>
            )}
        </Box>
    )
}
