import { Box, ButtonBase, Divider, IconButton, useTheme } from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import MessageIcon from '@mui/icons-material/Message'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { memo, useContext } from 'react'
import { ApplicationContext } from '../../App'
import type { ConcurrentTheme } from '../../model'
import { CCAvatar } from '../ui/CCAvatar'
import { useApi } from '../../context/api'
import { usePreference } from '../../context/PreferenceContext'
import { useGlobalActions } from '../../context/GlobalActions'
import { ConcurrentLogo } from '../theming/ConcurrentLogo'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { MinimalStreamList } from '../StreamList/MinimalStreamList'
import TerminalIcon from '@mui/icons-material/Terminal'

export interface MenuProps {
    onClick?: () => void
}

export const ThinMenu = memo<MenuProps>((props: MenuProps): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const appData = useContext(ApplicationContext)
    const actions = useGlobalActions()

    const theme = useTheme<ConcurrentTheme>()

    const iconColor = appData.websocketState === 1 ? theme.palette.background.contrastText : theme.palette.text.disabled

    if (!appData) {
        return <>loading...</>
    }

    return (
        <Box
            sx={{
                height: '100%',
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    color: 'background.contrastText'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ButtonBase
                        component={Link}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}
                        to={'/entity/' + (client.ccid ?? '')}
                        onClick={props.onClick}
                    >
                        <CCAvatar
                            avatarURL={client.user?.profile?.avatar}
                            identiconSource={client.ccid}
                            sx={{
                                width: '40px',
                                height: '40px'
                            }}
                        />
                    </ButtonBase>
                </Box>
                <Divider sx={{ mt: 1 }} />
                <Box display="flex" flexDirection="column" alignItems="center">
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/" onClick={props.onClick}>
                        <HomeIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/notifications" onClick={props.onClick}>
                        <NotificationsIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/associations" onClick={props.onClick}>
                        <MessageIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/explorer" onClick={props.onClick}>
                        <ExploreIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    {pref.devMode && (
                        <IconButton sx={{ p: 0.5 }} component={Link} to="/devtool" onClick={props.onClick}>
                            <TerminalIcon
                                sx={{
                                    color: 'background.contrastText'
                                }}
                            />
                        </IconButton>
                    )}
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/settings" onClick={props.onClick}>
                        <SettingsIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                </Box>
                <Divider sx={{ mt: 1 }} />
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        '&:hover': {
                            overflowY: 'auto'
                        }
                    }}
                >
                    <MinimalStreamList />
                </Box>
                <Divider />
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                    {!pref.showEditorOnTop && (
                        <IconButton
                            onClick={() => {
                                actions.openDraft()
                            }}
                            sx={{
                                color: 'background.contrastText'
                            }}
                        >
                            <CreateIcon />
                        </IconButton>
                    )}
                    <IconButton
                        sx={{
                            color: 'background.contrastText'
                        }}
                        onClick={() => {
                            actions.openMobileMenu()
                        }}
                    >
                        <KeyboardArrowRightIcon />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        zIndex: '-1',
                        opacity: { xs: '0.2', sm: '0.1' },
                        marginLeft: '-50px',
                        bottom: '-30px'
                    }}
                >
                    <ConcurrentLogo size="300px" upperColor={iconColor} lowerColor={iconColor} frameColor={iconColor} />
                </Box>
            </Box>
        </Box>
    )
})

ThinMenu.displayName = 'ThinMenu'
