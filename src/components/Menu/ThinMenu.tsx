import { Box, ButtonBase, Divider, IconButton } from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import ContactsIcon from '@mui/icons-material/Contacts'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { memo } from 'react'
import { CCAvatar } from '../ui/CCAvatar'
import { useClient } from '../../context/ClientContext'
import { usePreference } from '../../context/PreferenceContext'
import { useGlobalActions } from '../../context/GlobalActions'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { MinimalStreamList } from '../StreamList/MinimalStreamList'
import TerminalIcon from '@mui/icons-material/Terminal'

export interface MenuProps {
    onClick?: () => void
}

export const ThinMenu = memo<MenuProps>((props: MenuProps): JSX.Element => {
    const { client } = useClient()
    const actions = useGlobalActions()
    const [devMode] = usePreference('devMode')
    const [showEditorOnTop] = usePreference('showEditorOnTop')

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
                            avatarURL={client.user?.profile?.payload.body.avatar}
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
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/contacts" onClick={props.onClick}>
                        <ContactsIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    <IconButton sx={{ p: 0.5 }} component={Link} to="/explorer/stream" onClick={props.onClick}>
                        <ExploreIcon
                            sx={{
                                color: 'background.contrastText'
                            }}
                        />
                    </IconButton>
                    {devMode && (
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
                    {!showEditorOnTop && (
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
            </Box>
        </Box>
    )
})

ThinMenu.displayName = 'ThinMenu'
