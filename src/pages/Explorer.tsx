import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography,
    useTheme
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import type { Stream } from '../model'
import { Sign } from '../util'

export interface ExplorerProps {
    watchList: string[]
    setWatchList: (newlist: string[]) => void
}

export function Explorer(props: ExplorerProps): JSX.Element {
    const theme = useTheme()

    const appData = useContext(ApplicationContext)
    const [streams, setStreams] = useState<Stream[]>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const loadStreams = (): void => {
        fetch(
            appData.serverAddress +
                'stream/list?schema=net.gammalab.concurrent.tbdStreamMeta'
        ).then((data) => {
            data.json().then((json) => {
                setStreams(json)
            })
        })
    }

    const createNewStream = (name: string): void => {
        const payloadObj = {
            name
        }

        const payload = JSON.stringify(payloadObj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                author: appData.userAddress,
                maintainer: [],
                writer: [],
                reader: [],
                schema: 'net.gammalab.concurrent.tbdStreamMeta',
                meta: payload,
                signature
            })
        }

        fetch(appData.serverAddress + 'stream', requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                loadStreams()
            })
    }

    useEffect(() => {
        loadStreams()
    }, [])

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
                                        JSON.parse(value.meta).name as string
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
