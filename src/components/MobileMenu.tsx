import { Box, Button, useTheme, IconButton } from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import MessageIcon from '@mui/icons-material/Message'
import ExploreIcon from '@mui/icons-material/Explore'
import CreateIcon from '@mui/icons-material/Create'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { NavLink } from 'react-router-dom'

export interface MobileMenuProps {
    setMobileMenuOpen: (state: boolean) => void
}

export const MobileMenu = (props: MobileMenuProps): JSX.Element => {
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
                <IconButton
                    sx={{ color: 'divider' }}
                    onClick={() => {
                        props.setMobileMenuOpen(true)
                    }}
                >
                    <MenuIcon />
                </IconButton>
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
                <Button
                    color="primary"
                    variant="contained"
                    sx={{
                        height: 36,
                        my: 'auto',
                        width: 0.6
                    }}
                >
                    <CreateIcon />
                </Button>
            </Box>
        </>
    )
}
