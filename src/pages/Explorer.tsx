import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Checkbox,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { CCDrawer } from '../components/CCDrawer'
import Background from '../resources/defaultbg.png'

import Fuse from 'fuse.js'

interface StreamWithDomain {
    domain: string
    stream: Stream
}

export function Explorer(): JSX.Element {
    const client = useApi()
    const theme = useTheme()
    const pref = usePreference()

    const [streams, setStreams] = useState<StreamWithDomain[]>([])
    const [searchResult, setSearchResult] = useState<StreamWithDomain[]>([])
    const [newStreamName, setNewStreamName] = useState<string>('')
    const [search, setSearch] = useState<string>('')

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const [selectedStream, setSelectedStream] = useState<string>('')

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const fuse = useRef<Fuse<StreamWithDomain> | null>(null)

    const load = (): void => {
        client.api.getKnownHosts().then((e) => {
            if (!client.api.host) return
            const domains = [client.api.host, ...e.filter((e) => e.fqdn !== client.api.host).map((e) => e.fqdn)]
            Promise.all(
                domains.map(async (e) => {
                    const streams = await client.getCommonStreams(e)
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
        })
    }

    const createNewStream = (name: string): void => {
        client.createCommonStream(name, name).then((_) => {
            load()
        })
    }

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        if (streams.length === 0) return
        fuse.current = new Fuse(streams, {
            keys: ['stream.name', 'stream.description'],
            threshold: 0.3
        })
    }, [streams])

    useEffect(() => {
        if (fuse.current === null) return
        if (search === '') {
            setSearchResult(streams)
            return
        }
        setSearchResult(fuse.current.search(search).map((e) => e.item))
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
                Explorer
            </Typography>
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
                    ストリーム
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => {
                        setDrawerOpen(true)
                    }}
                >
                    新しく作る
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
                        <Card key={value.stream.id}>
                            <CardActionArea component={Link} to={'/stream#' + value.stream.id}>
                                <CardMedia component="img" height="140" image={value.stream.banner || Background} />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {value.stream.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {value.stream.description}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {value.domain}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <Tooltip title="リストに追加" placement="top" arrow>
                                    <IconButton
                                        sx={{ flexGrow: 0 }}
                                        onClick={(e) => {
                                            setMenuAnchor(e.currentTarget)
                                            setSelectedStream(value.stream.id)
                                        }}
                                    >
                                        <PlaylistAddIcon
                                            sx={{
                                                color: theme.palette.text.primary
                                            }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    )
                })}
            </Box>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                {Object.keys(pref.lists).map((e) => (
                    <MenuItem key={e} onClick={() => {}}>
                        {pref.lists[e].label}
                        <Checkbox
                            checked={pref.lists[e].streams.includes(selectedStream)}
                            onChange={(check) => {
                                const old = pref.lists
                                if (check.target.checked) {
                                    old[e].streams.push(selectedStream)
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                } else {
                                    old[e].streams = old[e].streams.filter((e) => e !== selectedStream)
                                    pref.setLists(JSON.parse(JSON.stringify(old)))
                                }
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
            <CCDrawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false)
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        label="stream name"
                        variant="outlined"
                        value={newStreamName}
                        sx={{ flexGrow: 1 }}
                        onChange={(e) => {
                            setNewStreamName(e.target.value)
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={(_) => {
                            createNewStream(newStreamName)
                            setDrawerOpen(false)
                        }}
                    >
                        Create
                    </Button>
                </Box>
            </CCDrawer>
        </Box>
    )
}
