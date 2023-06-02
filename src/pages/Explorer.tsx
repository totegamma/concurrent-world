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
    Typography,
    useTheme
} from '@mui/material'
import { useEffect, useState } from 'react'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import type { Host, Stream } from '../model'
import { useApi } from '../context/api'
import { useFollow } from '../context/FollowContext'
import { Schemas } from '../schemas'
import type { Commonstream } from '../schemas/commonstream'
import { Link } from 'react-router-dom'

export function Explorer(): JSX.Element {
    const api = useApi()
    const theme = useTheme()
    const follow = useFollow()

    const [hosts, setHosts] = useState<Host[]>([...(api.host ? [api.host] : [])])
    const [currentHost, setCurrentHost] = useState<string>(api.host?.fqdn ?? '')
    const [streams, setStreams] = useState<Array<Stream<any>>>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const loadHosts = (): void => {
        api.getKnownHosts().then((e) => {
            setHosts([...(api.host ? [api.host] : []), ...e])
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
                gap: '5px',
                padding: '20px',
                background: theme.palette.background.paper,
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Explorer
            </Typography>
            <Select
                value={currentHost}
                label="Host"
                onChange={(e) => {
                    setCurrentHost(e.target.value)
                }}
                defaultValue={api.host.fqdn}
            >
                {hosts.map((e) => (
                    <MenuItem key={e.fqdn} value={e.fqdn}>
                        {e.fqdn}
                    </MenuItem>
                ))}
            </Select>
            <Divider />
            <Typography variant="h3" gutterBottom>
                streams
            </Typography>
            <Box sx={{ display: 'flex', gap: '10px' }}>
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
                                <IconButton
                                    sx={{ flexGrow: 0 }}
                                    onClick={() => {
                                        if (follow.bookmarkingStreams.includes(value.id)) {
                                            follow.unbookmarkStream(value.id)
                                        } else {
                                            follow.bookmarkStream(value.id)
                                        }
                                    }}
                                >
                                    {follow.bookmarkingStreams.includes(value.id) ? (
                                        <StarIcon
                                            sx={{
                                                color: theme.palette.text.primary
                                            }}
                                        />
                                    ) : (
                                        <StarBorderIcon
                                            sx={{
                                                color: theme.palette.text.primary
                                            }}
                                        />
                                    )}
                                </IconButton>
                            }
                        >
                            <ListItemButton
                                component={Link}
                                to={'/#' + value.id}
                                sx={{
                                    height: '50px'
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
