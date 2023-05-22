import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
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

export interface ExplorerProps {
    watchList: string[]
    setWatchList: (newlist: string[]) => void
}

export function Explorer(props: ExplorerProps): JSX.Element {
    const api = useApi()
    const theme = useTheme()

    const [hosts, setHosts] = useState<Host[]>([])
    const [currentHost, setCurrentHost] = useState<string>()
    const [streams, setStreams] = useState<Array<Stream<any>>>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const loadHosts = (): void => {
        api.getKnownHosts().then((e) => {
            setHosts(e)
        })
    }

    const loadStreams = (): void => {
        api.getStreamListBySchema('net.gammalab.concurrent.tbdStreamMeta').then(
            (e) => {
                setStreams(e)
            }
        )
    }

    const createNewStream = (name: string): void => {
        api.createStream('net.gammalab.concurrent.tbdStreamMeta', {
            name
        }).then((_) => {
            loadStreams()
        })
    }

    useEffect(() => {
        loadHosts()
        loadStreams()
    }, [])

    useEffect(() => {}, [currentHost])

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
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {streams.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value.id}`
                    return (
                        <ListItem key={value.id} disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (props.watchList.includes(value.id)) {
                                        props.setWatchList(
                                            props.watchList.filter(
                                                (e) => e !== value.id
                                            )
                                        )
                                    } else {
                                        props.setWatchList([
                                            ...props.watchList,
                                            value.id
                                        ])
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {props.watchList.includes(value.id) ? (
                                        <StarIcon
                                            sx={{
                                                color: theme.palette.text
                                                    .primary
                                            }}
                                        />
                                    ) : (
                                        <StarBorderIcon
                                            sx={{
                                                color: theme.palette.text
                                                    .primary
                                            }}
                                        />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={`%${
                                        value.payload.body.name as string
                                    }`}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )
}
