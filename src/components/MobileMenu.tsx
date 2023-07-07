import { Box, Button, useTheme } from '@mui/material'

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
    const theme = useTheme()
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
                <Button
                    disableRipple
                    onClick={() => {
                        props.setMobileMenuOpen(true)
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
                {/*
                未実装の新規投稿モーダルダイアログ呼び出しボタン
                <Button
                    sx={{
                        height: 36,
                        my: 'auto',
                        width: 0.5,
                        特別なボタンなので固有の値を与えたい 
                        borderRadius: `20px 0 0 20px`,
                    }}
                    <CreateIcon />
                </Button>
                */}
            </Box>
        </>
    )
}
