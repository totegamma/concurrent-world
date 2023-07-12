import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { Schemas, type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Commonstream } from '../schemas/commonstream'
import { usePreference } from '../context/PreferenceContext'

import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove'

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'

export function Explorer(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const pref = usePreference()

    const [hosts, setHosts] = useState<string[]>([...(api.host ? [api.host] : [])])
    const [currentHost, setCurrentHost] = useState<string>(api.host ?? '')
    const [streams, setStreams] = useState<Array<Stream<any>>>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const loadHosts = (): void => {
        api.getKnownHosts().then((e) => {
            if (!api.host) return
            setHosts([api.host, ...e.filter((e) => e.fqdn !== api.host).map((e) => e.fqdn)])
        })
    }

    const loadStreams = (): void => {
        api.getStreamListBySchema(Schemas.commonstream, currentHost).then((e) => {
            setStreams(e)
        })
    }

    const createNewStream = (name: string): void => {
        api.createStream<Commonstream>(Schemas.commonstream, {
            name,
            shortname: name,
            description: ''
        }).then((_) => {
            loadStreams()
        })
    }

    useEffect(() => {
        loadHosts()
        loadStreams()
    }, [])

    useEffect(() => {
        loadStreams()
    }, [currentHost])

    if (!api.host) return <>loading...</>

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
            <Typography variant="h3" gutterBottom>
                server
            </Typography>
            <Select
                value={currentHost}
                label="Host"
                onChange={(e) => {
                    setCurrentHost(e.target.value)
                }}
                defaultValue={api.host}
            >
                {hosts.map((e) => (
                    <MenuItem key={e} value={e}>
                        {e}
                    </MenuItem>
                ))}
            </Select>
            <Divider />
            <Typography variant="h3" gutterBottom>
                streams
            </Typography>
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
                    }}
                >
                    Create
                </Button>
            </Box>
            <List dense sx={{ width: '100%' }}>
                {streams.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value.id}`
                    return (
                        <ListItem
                            key={value.id}
                            disablePadding
                            secondaryAction={
                                <>
                                    <Tooltip
                                        title={
                                            pref.bookmarkingStreams.includes(value.id)
                                                ? 'サイドバーから削除'
                                                : 'サイドバーに追加'
                                        }
                                        placement="top"
                                        arrow
                                    >
                                        <IconButton
                                            sx={{ flexGrow: 0 }}
                                            onClick={() => {
                                                if (pref.bookmarkingStreams.includes(value.id)) {
                                                    pref.unbookmarkStream(value.id)
                                                } else {
                                                    pref.bookmarkStream(value.id)
                                                }
                                            }}
                                        >
                                            {pref.bookmarkingStreams.includes(value.id) ? (
                                                <BookmarkRemoveIcon
                                                    sx={{
                                                        color: theme.palette.text.primary
                                                    }}
                                                />
                                            ) : (
                                                <BookmarkAddIcon
                                                    sx={{
                                                        color: theme.palette.text.primary
                                                    }}
                                                />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={pref.followingStreams.includes(value.id) ? 'フォロー解除' : 'フォロー'}
                                        placement="top"
                                        arrow
                                    >
                                        <IconButton
                                            sx={{ flexGrow: 0 }}
                                            onClick={() => {
                                                if (pref.followingStreams.includes(value.id)) {
                                                    pref.unfollowStream(value.id)
                                                } else {
                                                    pref.followStream(value.id)
                                                }
                                            }}
                                        >
                                            {pref.followingStreams.includes(value.id) ? (
                                                <PlaylistRemoveIcon
                                                    sx={{
                                                        color: theme.palette.text.primary
                                                    }}
                                                />
                                            ) : (
                                                <PlaylistAddIcon
                                                    sx={{
                                                        color: theme.palette.text.primary
                                                    }}
                                                />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </>
                            }
                        >
                            <ListItemButton
                                component={Link}
                                to={'/#' + value.id}
                                sx={{
                                    height: '40px'
                                }}
                            >
                                <ListItemText id={labelId} primary={`%${value.payload.body.name as string}`} />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )
}
