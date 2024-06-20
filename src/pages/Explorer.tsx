import { Box, Button, Divider, Paper, Tab, Tabs, TextField, Typography, useTheme } from '@mui/material'
import { type CommunityTimelineSchema, Schemas, type CoreProfile } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Fuzzysort from 'fuzzysort'

import { CCDrawer } from '../components/ui/CCDrawer'
import { CCEditor } from '../components/ui/cceditor'
import { useSnackbar } from 'notistack'
import { type StreamWithDomain } from '../model'
import { StreamCard } from '../components/Stream/Card'
import { SubProfileCard } from '../components/SubProfileCard'
import { DomainCard } from '../components/ui/DomainCard'

export function Explorer(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.explore' })
    const { client } = useClient()
    const theme = useTheme()
    const navigate = useNavigate()

    const { tab } = useParams()
    const path = useLocation()
    const hash = path.hash.replace('#', '')

    const hashQuery = useMemo(() => {
        const queries = hash.split('&')
        const result: Record<string, string> = {}
        queries.forEach((e) => {
            const [key, value] = e.split('=')
            if (!key || !value) return
            result[key] = value
        })
        return result
    }, [hash])

    const profileSchema = hashQuery.schema ?? Schemas.profile

    const [domains, setDomains] = useState<string[]>([])

    const [streams, setStreams] = useState<StreamWithDomain[]>([])
    const [searchResult, setSearchResult] = useState<StreamWithDomain[]>([])
    const [search, setSearch] = useState<string>('')
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const [characters, setProfiles] = useState<Array<CoreProfile<any>>>([])
    const [timelineDraft, setTimelineDraft] = useState<CommunityTimelineSchema>()

    const { enqueueSnackbar } = useSnackbar()

    const selectedDomains = useMemo(() => {
        return hashQuery.domains?.split(',') ?? [client.api.host]
    }, [hashQuery, client.api.host])

    const updateHash = (key: string, value: string): void => {
        hashQuery[key] = value
        const queries = Object.entries(hashQuery)
            .map((e) => e.join('='))
            .join('&')
        navigate(`/explorer/${tab}#${queries}`)
    }

    const load = (): void => {
        client.api.getDomains().then((e) => {
            if (!client.api.host) return
            const domains = [client.host, ...e.filter((e) => e.fqdn !== client.host).map((e) => e.fqdn)]
            setDomains(domains)
        })
    }

    useEffect(() => {
        if (tab !== 'timelines') return
        if (selectedDomains.length === 0) {
            setStreams([])
            setSearchResult([])
            return
        }
        let unmounted = false
        Promise.all(
            selectedDomains.map(async (e) => {
                const streams = await client.getTimelinesBySchema<CommunityTimelineSchema>(e, Schemas.communityTimeline)
                return streams.map((stream) => {
                    return {
                        domain: e,
                        stream
                    }
                })
            })
        ).then((e) => {
            if (unmounted) return
            const streams = e.flat()
            setStreams(streams)
            setSearchResult(streams)
        })
        return () => {
            unmounted = true
        }
    }, [selectedDomains, tab])

    useEffect(() => {
        if (tab !== 'users') return
        if (profileSchema === '') return
        let unmounted = false
        const timer = setTimeout(() => {
            Promise.all(
                selectedDomains.map(async (e) => {
                    return (
                        ((await client.api.getProfiles({ schema: profileSchema, domain: e }))?.filter(
                            (e) => e
                        ) as Array<CoreProfile<any>>) ?? []
                    )
                })
            ).then((e) => {
                if (unmounted) return
                setProfiles(e.flat())
            })
        }, 500)

        return () => {
            unmounted = true
            clearTimeout(timer)
        }
    }, [profileSchema, selectedDomains, tab])

    const createNewStream = (stream: any): void => {
        client.api
            .upsertTimeline(Schemas.communityTimeline, stream)
            .then((e: any) => {
                const id: string = e.id
                if (id) navigate('/timeline/' + id)
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
        console.log(streams)
        setSearchResult(
            Fuzzysort.go(search, streams, {
                keys: ['stream.document.body.name', 'stream.document.body.description']
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
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 2
                }}
            >
                {domains.map((e) => (
                    <DomainCard
                        key={e}
                        domainFQDN={e}
                        selected={selectedDomains.includes(e)}
                        onClick={() => {
                            updateHash('domains', e)
                        }}
                        onCheck={(state) => {
                            if (state) updateHash('domains', [...new Set([...selectedDomains, e])].join(','))
                            else updateHash('domains', selectedDomains.filter((f) => f !== e).join(','))
                        }}
                    />
                ))}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Tabs
                value={tab}
                onChange={(_, v) => {
                    navigate(`/explorer/${v}`)
                }}
            >
                <Tab value={'timelines'} label={'タイムライン'} />
                <Tab value={'users'} label={'ユーザー'} />
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            {tab === 'timelines' && (
                <>
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
                                    name={value.stream.document.body.name}
                                    description={value.stream.document.body.description ?? 'no description'}
                                    banner={value.stream.document.body.banner ?? ''}
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
                            <CCEditor
                                schemaURL={Schemas.communityTimeline}
                                value={timelineDraft}
                                setValue={setTimelineDraft}
                            />
                            <Button
                                onClick={() => {
                                    createNewStream(timelineDraft)
                                }}
                            >
                                作成
                            </Button>
                        </Box>
                    </CCDrawer>
                </>
            )}
            {tab === 'users' && (
                <>
                    <Typography variant="h3" gutterBottom>
                        プロフィール
                    </Typography>
                    <TextField
                        label="search"
                        variant="outlined"
                        value={profileSchema}
                        onChange={(e) => {
                            updateHash('schema', e.target.value)
                        }}
                    />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: 2
                        }}
                    >
                        {characters.map((character) => (
                            <Paper key={character.id} variant="outlined">
                                <SubProfileCard showccid character={character} />
                            </Paper>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    )
}
