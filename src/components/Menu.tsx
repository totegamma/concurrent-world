import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import MessageIcon from '@mui/icons-material/Message';
import ExploreIcon from '@mui/icons-material/Explore';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PercentIcon from '@mui/icons-material/Percent';

export interface MenuProps {
    streams: string[]
    setCurrentStreams: (input: string) => void
}

export function Menu(props: MenuProps) {
    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
            <Box sx={{width: "200px", padding: "20px", color: "#fff"}}>
                <Typography variant="h5" gutterBottom>Concurrent</Typography>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <HomeIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/">
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <NotificationsIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/notification">
                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <MessageIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/associations">
                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <ExploreIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/explorer">
                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <BadgeIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/profile">
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemIcon>
                                <SettingsIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/settings">
                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                    {props.streams.map((value) => {
                        const labelId = `checkbox-list-secondary-label-${value}`;
                        return (
                        <ListItem
                            key={value}
                            disablePadding
                        >
                            <ListItemIcon>
                                <PercentIcon sx={{ color: "white" }} />
                            </ListItemIcon>
                            <ListItemButton component={Link} to="/" onClick={() => {
                                    props.setCurrentStreams(value);
                                }}>
                                <ListItemText id={labelId} primary={value} />
                            </ListItemButton>
                        </ListItem>
                        );
                    })}
                    </List>
                </Box>
            </Box>
        </Box>
    )
}
