import {
    Box,
    Button,
    Checkbox,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

export function Explorer(): JSX.Element {
    const client = useApi()
    const theme = useTheme()
    const pref = usePreference()

    const [hosts, setHosts] = useState<string[]>([...(client.api.host ? [client.api.host] : [])])
    const [currentHost, setCurrentHost] = useState<string>(client.api.host ?? '')
    const [streams, setStreams] = useState<Stream[]>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
    const [selectedStream, setSelectedStream] = useState<string>('')

    const loadHosts = (): void => {
        client.api.getKnownHosts().then((e) => {
            if (!client.api.host) return
            setHosts([client.api.host, ...e.filter((e) => e.fqdn !== client.api.host).map((e) => e.fqdn)])
        })
    }

    const loadStreams = (): void => {
        client.getCommonStreams(currentHost).then((e) => {
            setStreams(e)
        })
    }

    const createNewStream = (name: string): void => {
        client.createCommonStream(currentHost, name).then((_) => {})
    }

    useEffect(() => {
        loadHosts()
        loadStreams()
    }, [])

    useEffect(() => {
        loadStreams()
    }, [currentHost])

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
            <Typography variant="h3" gutterBottom>
                server
            </Typography>
            <Select
                value={currentHost}
                label="Host"
                onChange={(e) => {
                    setCurrentHost(e.target.value)
                }}
                defaultValue={client.api.host}
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
                                    <Tooltip title="リストに追加" placement="top" arrow>
                                        <IconButton
                                            sx={{ flexGrow: 0 }}
                                            onClick={(e) => {
                                                setMenuAnchor(e.currentTarget)
                                                setSelectedStream(value.id)
                                            }}
                                        >
                                            <PlaylistAddIcon
                                                sx={{
                                                    color: theme.palette.text.primary
                                                }}
                                            />
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
                                <ListItemText id={labelId} primary={`%${value.name}`} />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
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
        </Box>
    )
}
