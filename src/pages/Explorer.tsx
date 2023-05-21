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

// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
const branchName = branch || window.location.host.split('.')[0]

export interface ExplorerProps {
    watchList: string[]
    setWatchList: (newlist: string[]) => void
}

export function Explorer(props: ExplorerProps): JSX.Element {
    const theme = useTheme()

    const appData = useContext(ApplicationContext)
    const [streams, setStreams] = useState<Array<Stream<any>>>([])
    const [newStreamName, setNewStreamName] = useState<string>('')

    const loadStreams = (): void => {
        fetch(
            appData.serverAddress +
                'stream/list?schema=net.gammalab.concurrent.tbdStreamMeta'
        ).then((data) => {
            data.json().then((arr) => {
                setStreams(
                    arr.map((e: any) => {
                        return { ...e, payload: JSON.parse(e.payload) }
                    })
                )
            })
        })
    }

    const createNewStream = (name: string): void => {
        const signObject = {
            signer: appData.userAddress,
            type: 'Stream',
            schema: 'net.gammalab.concurrent.tbdStreamMeta',
            body: {
                name
            },
            meta: {
                client: `concurrent-web ${branchName as string}-${
                    sha as string
                }`
            },
            signedAt: new Date().toISOString(),
            maintainer: [],
            writer: [],
            reader: []
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(appData.privatekey, signedObject)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                signedObject,
                signature
            })
        }

        fetch(appData.serverAddress + 'stream', requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
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
