import {
    Avatar,
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
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
import type { IuseResourceManager } from '../hooks/useResourceManager'
import type { Stream, User } from '../model'
import { Sign } from '../util'

export interface ExplorerProps {
    watchList: string[]
    followList: string[]
    setFollowList: (newlist: string[]) => void
    setWatchList: (newlist: string[]) => void
    userDict: IuseResourceManager<User>
}

export function Explorer(props: ExplorerProps): JSX.Element {
    const theme = useTheme()

    const appData = useContext(ApplicationContext)
    const [streams, setStreams] = useState<Stream[]>([])
    const [followList, setFollowList] = useState<User[]>([])
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
            headers: {},
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

    useEffect(() => {
        ;(async () => {
            setFollowList(
                await Promise.all(
                    props.followList.map(
                        async (ccaddress) => await props.userDict.get(ccaddress)
                    )
                )
            )
        })()
    }, [props.followList])

    const unfollow = (ccaddress: string): void => {
        props.setFollowList(props.followList.filter((e) => e !== ccaddress))
    }

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
            <Typography variant="h3" gutterBottom>
                followlist
            </Typography>
            <List
                dense
                sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'background.paper'
                }}
            >
                {followList.map((user) => (
                    <ListItem
                        key={user.ccaddress}
                        secondaryAction={
                            <Button
                                onClick={() => {
                                    unfollow(user.ccaddress)
                                }}
                            >
                                unfollow
                            </Button>
                        }
                        disablePadding
                    >
                        <ListItemButton>
                            <ListItemAvatar>
                                <Avatar src={user.avatar} />
                            </ListItemAvatar>
                            <ListItemText primary={user.username} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}
