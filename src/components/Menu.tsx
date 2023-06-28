import {
    Box,
    ButtonBase,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme
} from '@mui/material'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import BadgeIcon from '@mui/icons-material/Badge'
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
import { StreamList } from './StreamList'
import { CCAvatar } from './CCAvatar'
import { useApi } from '../context/api'
import { ConcurrentWordmark } from './ConcurrentWordmark'

const branchName = branch || window.location.host.split('.')[0]

export interface MenuProps {
    hideMenu?: boolean
    onClick?: () => void
}

export const Menu = memo<MenuProps>((props: MenuProps): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)

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
                    pt: '25px',
                    color: 'background.contrastText'
                }}
            >
                <ConcurrentWordmark color={iconColor} />
                <Box sx={{ textAlign: 'center', fontWeight: 600 }}>開発中α版</Box>
                <Box
                    sx={{
                        textAlign: 'center',
                        fontWeight: 400,
                        fontSize: '12px',
                        marginBottom: '10px'
                    }}
                >
                    buildTime: {buildTime.toLocaleString()}
                    <br />
                    branch: {branchName}
                    <br />
                    sha: {sha.slice(0, 7)}
                </Box>
                <Divider />
                {!props.hideMenu && (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px'
                            }}
                        >
                            <List dense sx={{ width: '100%' }}>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/">
                                        <HomeIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Home" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/notifications">
                                        <NotificationsIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Notifications" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/associations">
                                        <MessageIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Associations" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/explorer">
                                        <ExploreIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Explorer" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/identity">
                                        <BadgeIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Identity" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/settings">
                                        <SettingsIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="Settings" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ gap: 1 }} component={Link} to="/devtool">
                                        <BuildIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary="DevTool" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Box>
                        <Divider />
                    </>
                )}
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
                    <StreamList onClick={props.onClick} />
                </Box>
                <ButtonBase
                    component={Link}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        gap: 1
                    }}
                    to={'/entity/' + (appData.profile?.author ?? '')}
                >
                    <CCAvatar
                        alt={appData.profile?.payload.body.username}
                        avatarURL={appData.profile?.payload.body.avatar}
                        identiconSource={api.userAddress}
                        sx={{
                            width: '40px',
                            height: '40px'
                        }}
                    />
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexFlow: 'column' }}>
                        <Typography color={theme.palette.background.contrastText}>
                            {appData.profile?.payload.body.username}
                        </Typography>
                        <Typography variant="caption" color={theme.palette.background.contrastText}>
                            {api.host}
                        </Typography>
                    </Box>
                </ButtonBase>
            </Box>
        </Box>
    )
})

Menu.displayName = 'Menu'
