import { Box, Button, alpha, useTheme } from '@mui/material'

import HomeIcon from '@mui/icons-material/Home'
import ContactsIcon from '@mui/icons-material/Contacts'
import ExploreIcon from '@mui/icons-material/Explore'
import CreateIcon from '@mui/icons-material/Create'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { NavLink } from 'react-router-dom'
import { useGlobalActions } from '../../context/GlobalActions'
import type { ConcurrentTheme } from '../../model'
import { useEditorModal } from '../EditorModal'

export const MobileMenu = (): JSX.Element => {
    const theme = useTheme<ConcurrentTheme>()
    const actions = useGlobalActions()
    const editorModal = useEditorModal()

    return (
        <Box
            sx={{
                display: 'flex',
                height: 49,
                color: 'white',
                justifyContent: 'space-around',
                marginBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            <Button
                disableRipple
                variant="text"
                onClick={() => {
                    actions.openMobileMenu()
                }}
                sx={{
                    color: 'divider',
                    minWidth: 0,
                    width: 0.5
                }}
            >
                <MenuIcon
                    fontSize="large"
                    sx={{
                        borderRadius: 1,
                        border: '1px solid',
                        padding: 0.3
                    }}
                />
            </Button>
            <Button variant="text" sx={{ color: 'background.contrastText', width: 1 }} component={NavLink} to="/">
                <HomeIcon />
            </Button>
            <Button
                variant="text"
                sx={{ color: 'background.contrastText', width: 1 }}
                component={NavLink}
                to="/notifications"
            >
                <NotificationsIcon />
            </Button>
            <Button
                variant="text"
                sx={{ color: 'background.contrastText', width: 1 }}
                component={NavLink}
                to="/contacts"
            >
                <ContactsIcon />
            </Button>
            <Button
                variant="text"
                sx={{ color: 'background.contrastText', width: 1 }}
                component={NavLink}
                to="/explorer/timelines"
            >
                <ExploreIcon />
            </Button>
            <Button
                variant="text"
                sx={{
                    height: 36,
                    my: 'auto',
                    width: 0.5,
                    borderRadius: `20px 0 0 20px`,
                    backgroundColor: alpha(theme.palette.background.contrastText, 0.9),
                    ':hover': {
                        backgroundColor: alpha(theme.palette.background.contrastText, 1)
                    }
                }}
                onClick={() => {
                    editorModal.open()
                }}
            >
                <CreateIcon
                    sx={{
                        color: 'background.default'
                    }}
                />
            </Button>
        </Box>
    )
}
