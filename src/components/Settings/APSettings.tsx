import { Box, Button, Divider, IconButton, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { type ApEntity } from '../../model'
import { ApSetup } from '../Activitypub/Setup'
import { ApProfileEditor } from '../Activitypub/ProfileEditor'
import { ApFollowManager } from '../Activitypub/FollowManager'
import { AddListButton } from '../AddListButton'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import { CCDrawer } from '../ui/CCDrawer'
import { useNavigate } from 'react-router-dom'

export const APSettings = (): JSX.Element => {
    const { client } = useClient()
    const [entity, setEntity] = useState<ApEntity | null | undefined>(undefined)
    const [openInquiry, setOpenInquiry] = useState(false)
    const [url, setUrl] = useState('')
    const navigate = useNavigate()

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

    const inquery = (url: string): void => {
        client.api
            .fetchWithCredential(client.api.host, `/ap/api/import?note=${encodeURIComponent(url)}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(async (res) => await res.json())
            .then((data) => {
                navigate(`/message/${data.content.id}@${data.content.author}`)
            })
    }

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
                        <IconButton>
                            <TravelExploreIcon
                                onClick={() => {
                                    setOpenInquiry(true)
                                }}
                            />
                        </IconButton>
                        <AddListButton stream={entity.followstream} />
                    </Box>
                    <ApProfileEditor entity={entity} />
                    <ApFollowManager />
                </>
            )}
            <CCDrawer
                open={openInquiry}
                onClose={() => {
                    setOpenInquiry(false)
                }}
            >
                <Box display="flex" width="100%" gap={1} padding={1} flexDirection="column">
                    <Typography variant="h2">照会</Typography>
                    <Divider />
                    <Box display="flex" width="100%" gap={1} padding={1}>
                        <TextField
                            label="照会"
                            variant="outlined"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value)
                            }}
                            sx={{
                                flexGrow: 1
                            }}
                        />
                        <Button
                            onClick={() => {
                                inquery(url)
                            }}
                        >
                            照会
                        </Button>
                    </Box>
                </Box>
            </CCDrawer>
        </Box>
    )
}
