import {
    Box,
    Button,
    ButtonBase,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme
} from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import BuildIcon from '@mui/icons-material/Build'
import MessageIcon from '@mui/icons-material/Message'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { memo, useContext } from 'react'
import { ApplicationContext } from '../App'
import type { ConcurrentTheme } from '../model'
// @ts-expect-error vite dynamic import
import buildTime from '~build/time'
// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
import { StreamList } from './StreamList/main'
import { CCAvatar } from './CCAvatar'
import { useApi } from '../context/api'
import { usePreference } from '../context/PreferenceContext'
import { useGlobalActions } from '../context/GlobalActions'
import { ConcurrentLogo } from './ConcurrentLogo'

const branchName = branch || window.location.host.split('.')[0]

export interface MenuProps {
    onClick?: () => void
}

export const Menu = memo<MenuProps>((props: MenuProps): JSX.Element => {
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
                <Box sx={{ px: 2, pb: 1 }}>
                    <ButtonBase
                        component={Link}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'left',
                            gap: 1
                        }}
                        to={'/entity/' + (client.ccid ?? '')}
                        onClick={props.onClick}
                    >
                        <CCAvatar
                            avatarURL={appData.user?.profile?.avatar}
                            identiconSource={client.ccid}
                            sx={{
                                width: '40px',
                                height: '40px'
                            }}
                        />
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexFlow: 'column' }}>
                            <Typography color={theme.palette.background.contrastText}>
                                {appData.user?.profile?.username}
                            </Typography>
                            <Typography variant="caption" color={theme.palette.background.contrastText}>
                                {client.api.host}
                            </Typography>
                        </Box>
                    </ButtonBase>
                </Box>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <List dense sx={{ py: 0.5, width: '100%' }}>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={Link} to="/" onClick={props.onClick}>
                                <HomeIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/notifications"
                                onClick={props.onClick}
                            >
                                <NotificationsIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />

                                <ListItemText primary="Notifications" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={Link} to="/associations" onClick={props.onClick}>
                                <MessageIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />

                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={Link} to="/explorer" onClick={props.onClick}>
                                <ExploreIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />

                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        {pref.devMode && (
                            <ListItem disablePadding>
                                <ListItemButton sx={{ gap: 1 }} component={Link} to="/devtool" onClick={props.onClick}>
                                    <BuildIcon
                                        sx={{
                                            color: 'background.contrastText'
                                        }}
                                    />

                                    <ListItemText primary="DevTool" />
                                </ListItemButton>
                            </ListItem>
                        )}
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={Link} to="/settings" onClick={props.onClick}>
                                <SettingsIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />
                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider />
                <Box
                    sx={{
                        flex: 1,
                        scrollbarGutter: 'stable',
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        '&:hover': {
                            overflowY: 'auto'
                        }
                    }}
                >
                    <StreamList />
                </Box>
                {!pref.showEditorOnTop && (
                    <Button
                        variant="contained"
                        endIcon={<CreateIcon />}
                        onClick={() => {
                            actions.openDraft()
                        }}
                        sx={{
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        投稿する
                    </Button>
                )}
                <Divider />
                <Box
                    sx={{
                        textAlign: 'left',
                        fontWeight: 400,
                        fontSize: '0.7rem',
                        marginBottom: '10px',
                        p: 1
                    }}
                >
                    <Box sx={{ textAlign: 'center', fontWeight: 600, mb: 'env(safe-area-inset-bottom)' }}>
                        開発中α版
                    </Box>
                    buildTime: {buildTime.toLocaleString()}
                    <br />
                    branch: {branchName}
                    <br />
                    sha: {sha.slice(0, 7)}
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

Menu.displayName = 'Menu'
