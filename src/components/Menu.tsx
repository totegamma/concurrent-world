import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
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

export interface MenuProps {
    streams: string[]
}

export function Menu(props: MenuProps): JSX.Element {
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
                        {props.streams.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value}`
                            return (
                                <ListItem key={value} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={`/#${value}`}
                                        sx={{ gap: 1 }}
                                    >
                                        <PercentIcon sx={{ color: 'white' }} />
                                        <ListItemText
                                            id={labelId}
                                            primary={value}
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
