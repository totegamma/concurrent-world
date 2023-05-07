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
                    color: 'background.contrastText'
                }}
            >
                <Typography variant="h5" sx={{ pl: '18px' }} gutterBottom>
                    Concurrent
                </Typography>
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
                                <HomeIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/notification"
                            >
                                <NotificationsIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/associations"
                            >
                                <MessageIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/explorer"
                            >
                                <ExploreIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/identity"
                            >
                                <BadgeIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

                                <ListItemText primary="Identity" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/settings"
                            >
                                <SettingsIcon
                                    sx={{ color: 'background.contrastText' }}
                                />

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
                                        <PercentIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />
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
