import { Box, Button, Checkbox, Divider, IconButton, Paper, TextField, Typography, useTheme } from '@mui/material'
import { type CommonstreamSchema, Schemas } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Fuzzysort from 'fuzzysort'

import { CCDrawer } from '../components/ui/CCDrawer'

import { CCEditor } from '../components/ui/cceditor'
import { useSnackbar } from 'notistack'

import DoneAllIcon from '@mui/icons-material/DoneAll'
import RemoveDoneIcon from '@mui/icons-material/RemoveDone'
import { type StreamWithDomain } from '../model'
import { StreamCard } from '../components/Stream/Card'

export function Explorer(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.explore' })
    const client = useApi()
    const theme = useTheme()
    const navigate = useNavigate()

    const [domains, setDomains] = useState<string[]>([])
    const [selectedDomains, setSelectedDomains] = useState<string[]>([client.api.host])

    const [streams, setStreams] = useState<StreamWithDomain[]>([])
    const [searchResult, setSearchResult] = useState<StreamWithDomain[]>([])
    const [search, setSearch] = useState<string>('')

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar()

    const load = (): void => {
        client.api.getDomains().then((e) => {
            if (!client.api.host) return
            const domains = [client.host, ...e.filter((e) => e.fqdn !== client.host).map((e) => e.fqdn)]
            setDomains(domains)
        })
    }

    useEffect(() => {
        if (selectedDomains.length === 0) {
            setStreams([])
            setSearchResult([])
            return
        }
        Promise.all(
            selectedDomains.map(async (e) => {
                const streams = await client.getStreamsBySchema<CommonstreamSchema>(e, Schemas.commonstream)
                return streams.map((stream) => {
                    return {
                        domain: e,
                        stream
                    }
                })
            })
        ).then((e) => {
            const streams = e.flat()
            setStreams(streams)
            setSearchResult(streams)
        })
    }, [selectedDomains])

    const createNewStream = (stream: any): void => {
        client.api
            .createStream(Schemas.commonstream, stream)
            .then((e: any) => {
                const id: string = e.id
                if (id) navigate('/stream#' + id)
                else enqueueSnackbar('ストリームの作成に失敗しました', { variant: 'error' })
            })
            .catch((e) => {
                console.error(e)
                enqueueSnackbar('ストリームの作成に失敗しました', { variant: 'error' })
            })
    }

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        if (search === '') {
            setSearchResult(streams)
            return
        }
        setSearchResult(
            Fuzzysort.go(search, streams, {
                keys: ['stream.name', 'stream.description']
            }).map((e) => e.obj)
        )
    }, [search])

    if (!client.api.host) return <>loading...</>

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: '20px',
                background: theme.palette.background.paper,
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                {t('title')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                }}
            >
                <Typography variant="h3" gutterBottom>
                    {t('domains')}
                </Typography>
                <Box>
                    <IconButton
                        onClick={() => {
                            setSelectedDomains([])
                        }}
                    >
                        <RemoveDoneIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => {
                            setSelectedDomains(domains)
                        }}
                    >
                        <DoneAllIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2
                }}
            >
                {domains.map((e) => {
                    return (
                        <Paper
                            key={e}
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px',
                                gap: 1,
                                outline: selectedDomains.includes(e)
                                    ? '2px solid ' + theme.palette.primary.main
                                    : 'none'
                            }}
                            onClick={() => {
                                setSelectedDomains([e])
                            }}
                        >
                            <Typography variant="h4" gutterBottom>
                                {e}
                            </Typography>
                            <Checkbox
                                checked={selectedDomains.includes(e)}
                                onChange={(event) => {
                                    if (event.target.checked) setSelectedDomains([...selectedDomains, e])
                                    else setSelectedDomains(selectedDomains.filter((f) => f !== e))
                                }}
                            />
                        </Paper>
                    )
                })}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant="h3" gutterBottom>
                    {t('streams')}
                </Typography>
                <Button
                    onClick={() => {
                        setDrawerOpen(true)
                    }}
                >
                    {t('createNew')}
                </Button>
            </Box>
            <TextField
                label="search"
                variant="outlined"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                }}
            />
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2
                }}
            >
                {searchResult.map((value) => {
                    return (
                        <StreamCard
                            key={value.stream.id}
                            streamID={value.stream.id}
                            name={value.stream.payload.name}
                            description={value.stream.payload.description}
                            banner={value.stream.payload.banner ?? ''}
                            domain={value.domain}
                            isOwner={value.stream.author === client.ccid}
                        />
                    )
                })}
            </Box>
            <CCDrawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false)
                }}
            >
                <Box p={1}>
                    <Typography variant="h3" gutterBottom>
                        {t('createNewStream.title')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {t('createNewStream.desc1')}
                        {client.api.host}
                        {t('createNewStream.desc2')}
                    </Typography>
                    <Divider />
                    <CCEditor schemaURL={Schemas.commonstream} onSubmit={createNewStream} />
                </Box>
            </CCDrawer>
        </Box>
    )
}
