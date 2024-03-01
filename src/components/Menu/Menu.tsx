import {
    Box,
    Button,
    ButtonBase,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import { Link } from 'react-router-dom'

import HomeIcon from '@mui/icons-material/Home'
import TerminalIcon from '@mui/icons-material/Terminal'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ContactsIcon from '@mui/icons-material/Contacts'
import { memo } from 'react'
// @ts-expect-error vite dynamic import
import buildTime from '~build/time'
// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
import { StreamList } from '../StreamList/main'
import { CCAvatar } from '../ui/CCAvatar'
import { useClient } from '../../context/ClientContext'
import { usePreference } from '../../context/PreferenceContext'
import { useGlobalActions } from '../../context/GlobalActions'
import { useTranslation } from 'react-i18next'

const branchName = branch || window.location.host.split('.')[0]

export interface MenuProps {
    onClick?: () => void
}

export const Menu = memo<MenuProps>((props: MenuProps): JSX.Element => {
    const { client } = useClient()
    const actions = useGlobalActions()
    const { t } = useTranslation('', { keyPrefix: 'pages' })
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
                            avatarURL={client?.user?.profile?.payload.body.avatar}
                            identiconSource={client.ccid}
                            sx={{
                                width: '40px',
                                height: '40px'
                            }}
                        />
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexFlow: 'column' }}>
                            <Typography color="contrastText">{client?.user?.profile?.payload.body.username}</Typography>
                            <Typography variant="caption" color="background.contrastText">
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
                                <ListItemText primary={t('home.title')} />
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

                                <ListItemText primary={t('notifications.title')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={Link} to="/contacts" onClick={props.onClick}>
                                <ContactsIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />

                                <ListItemText primary={t('contacts.title')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                sx={{ gap: 1 }}
                                component={Link}
                                to="/explorer/streams"
                                onClick={props.onClick}
                            >
                                <ExploreIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />

                                <ListItemText primary={t('explore.title')} />
                            </ListItemButton>
                        </ListItem>
                        {devMode && (
                            <ListItem disablePadding>
                                <ListItemButton sx={{ gap: 1 }} component={Link} to="/devtool" onClick={props.onClick}>
                                    <TerminalIcon
                                        sx={{
                                            color: 'background.contrastText'
                                        }}
                                    />

                                    <ListItemText primary={t('devtool.title')} />
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
                                <ListItemText primary={t('settings.title')} />
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
                {!showEditorOnTop && (
                    <Button
                        endIcon={<CreateIcon />}
                        onClick={() => {
                            actions.openDraft()
                        }}
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                            height: 36,
                            borderRadius: `100px`
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
            </Box>
        </Box>
    )
})

Menu.displayName = 'Menu'
