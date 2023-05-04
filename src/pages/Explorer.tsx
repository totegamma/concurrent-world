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
    Typography,
    useTheme
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import type { IuseResourceManager } from '../hooks/useResourceManager'
import type { User } from '../model'

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
    const [streams, setStreams] = useState<string[]>([])
    const [followList, setFollowList] = useState<User[]>([])

    useEffect(() => {
        fetch(appData.serverAddress + 'stream/list').then((data) => {
            data.json().then((json) => {
                setStreams(json)
            })
        })
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
            <Typography variant="h5" gutterBottom>
                Explorer
            </Typography>
            <Divider />
            <Typography variant="h6" gutterBottom>
                streams
            </Typography>
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {streams.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value}`
                    return (
                        <ListItem key={value} disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (props.watchList.includes(value)) {
                                        props.setWatchList(
                                            props.watchList.filter(
                                                (e) => e !== value
                                            )
                                        )
                                    } else {
                                        props.setWatchList([
                                            ...props.watchList,
                                            value
                                        ])
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {props.watchList.includes(value) ? (
                                        <StarIcon />
                                    ) : (
                                        <StarBorderIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={`%${value}`}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
            <Typography variant="h6" gutterBottom>
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
                        key={user.pubkey}
                        secondaryAction={
                            <Button
                                onClick={() => {
                                    unfollow(user.pubkey)
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
