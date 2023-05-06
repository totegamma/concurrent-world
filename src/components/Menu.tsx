import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import BadgeIcon from '@mui/icons-material/Badge'
import MessageIcon from '@mui/icons-material/Message'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PercentIcon from '@mui/icons-material/Percent'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import { type Stream } from '../model'
import { ConcurrentLogo } from './ConcurrentLogo'

export interface MenuProps {
    streams: string[]
}

export function Menu(props: MenuProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const [watchStreams, setWatchStreams] = useState<Stream[]>([])

    useEffect(() => {
        ;(async () => {
            setWatchStreams(
                (
                    await Promise.all(
                        props.streams.map(
                            async (id) => await appData.streamDict?.get(id)
                        )
                    )
                ).filter((e) => e) as Stream[]
            )
        })()
    }, [props.streams])

    return (
        <Box sx={{ gap: '15px', height: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '200px',
                    height: '100%',
                    pt: '25px',
                    color: '#fff'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center'
                    }}
                >
                    <Box>
                        <ConcurrentLogo
                            size="32px"
                            upperColor="white"
                            lowerColor="white"
                            frameColor="white"
                        />
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        Concurrent
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                    }}
                >
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/"
                            >
                                <HomeIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/notification"
                            >
                                <NotificationsIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/associations"
                            >
                                <MessageIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/explorer"
                            >
                                <ExploreIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/identity"
                            >
                                <BadgeIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Identity" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/settings"
                            >
                                <SettingsIcon sx={{ color: 'white' }} />

                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <List
                        dense
                        sx={{
                            width: '100%',
                            maxWidth: 360,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {watchStreams.map((stream) => {
                            const labelId = `checkbox-list-secondary-label-${stream.id}`
                            return (
                                <ListItem key={stream.id} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={`/#${stream.id}`}
                                        sx={{ gap: 1 }}
                                    >
                                        <PercentIcon sx={{ color: 'white' }} />
                                        <ListItemText
                                            id={labelId}
                                            primary={
                                                stream.meta
                                                    ? JSON.parse(stream.meta)
                                                          .name
                                                    : 'backrooms'
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
            </Box>
        </Box>
    )
}
