import { Box, Button, IconButton } from '@mui/material'
import { useState } from 'react'

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
                <Button
                    onClick={() => {
                        props.setMobileMenuOpen(true)
                    }}
                    sx={{ color: 'divider', transition: 'none', minWidth: 0, width: 0.3 }}
                >
                    <MenuIcon />
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
                */}
            </Box>
        </>
    )
}
