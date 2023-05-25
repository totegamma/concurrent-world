import { Box, Button } from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import BadgeIcon from '@mui/icons-material/Badge'
import MessageIcon from '@mui/icons-material/Message'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { NavLink } from 'react-router-dom'

export function MobileMenu(): JSX.Element {
    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    height: 49,
                    color: 'white',
                    justifyContent: 'space-around',
                    marginBottom: 'env(safe-area-inset-bottom)'
                }}
            >
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/">
                    <HomeIcon />
                </Button>
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/notifications">
                    <NotificationsIcon />
                </Button>
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/associations">
                    <MessageIcon />
                </Button>
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/explorer">
                    <ExploreIcon />
                </Button>
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/identity">
                    <BadgeIcon />
                </Button>
                <Button sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/settings">
                    <SettingsIcon />
                </Button>
            </Box>
        </>
    )
}
