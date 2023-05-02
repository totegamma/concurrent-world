import { Box, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export interface MenuProps {
    streams: string[]
    setCurrentStreams: (input: string) => void
    setPostStreams: (input: string) => void
}

export function Menu(props: MenuProps) {
    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>
            <Box sx={{width: "200px", paddingTop: "30px", color: "#fff"}}>
                <Typography variant="h5" gutterBottom>Concurrent</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/">
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/notification">
                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/associations">
                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/explorer">
                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/profile">
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
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
                            <ListItemButton  onClick={() => {
                                    props.setCurrentStreams(`${value},0`);
                                    props.setPostStreams(value);
                                }}>
                                <ListItemText id={labelId} primary={`%${value}`} />
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
