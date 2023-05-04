import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
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
    setCurrentStreams: (input: string) => void
}

export function Menu (props: MenuProps): JSX.Element {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Box sx={{ width: '200px', padding: '20px', color: '#fff' }}>
                <Typography variant="h5" gutterBottom>Concurrent</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/">
                                <ListItemIcon><HomeIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/notification">
                                <ListItemIcon><NotificationsIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/associations">
                                <ListItemIcon><MessageIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/explorer">
                                <ListItemIcon><ExploreIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/profile">
                                <ListItemIcon><BadgeIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/settings">
                                <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider/>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        {props.streams.map((value) => {
                            const labelId = `checkbox-list-secondary-label-${value}`
                            return (
                                <ListItem
                                    key={value}
                                    disablePadding
                                >
                                    <ListItemButton component={Link} to="/" onClick={() => {
                                        props.setCurrentStreams(value)
                                    }}>
                                        <ListItemIcon><PercentIcon sx={{ color: 'white' }} /></ListItemIcon>
                                        <ListItemText id={labelId} primary={value} />
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
