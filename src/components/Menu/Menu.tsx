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
    Link
} from '@mui/material'
import CreateIcon from '@mui/icons-material/Create'
import { Link as NavLink } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import TerminalIcon from '@mui/icons-material/Terminal'
import ExploreIcon from '@mui/icons-material/Explore'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ContactsIcon from '@mui/icons-material/Contacts'
import VerifiedIcon from '@mui/icons-material/Verified'
import { memo } from 'react'
import { ListsMenu } from '../ListsMenu/main'
import { CCAvatar } from '../ui/CCAvatar'
import { useClient } from '../../context/ClientContext'
import { usePreference } from '../../context/PreferenceContext'
import { useGlobalActions } from '../../context/GlobalActions'
import { useTranslation } from 'react-i18next'

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
                        component={NavLink}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'left',
                            gap: 1
                        }}
                        to={'/' + (client.ccid ?? '')}
                        onClick={props.onClick}
                    >
                        <CCAvatar
                            avatarURL={client?.user?.profile?.avatar}
                            identiconSource={client.ccid}
                            sx={{
                                width: '40px',
                                height: '40px'
                            }}
                        />
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', flexFlow: 'column' }}>
                            <Typography color="contrastText">{client?.user?.profile?.username}</Typography>
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
                            <ListItemButton sx={{ gap: 1 }} component={NavLink} to="/" onClick={props.onClick}>
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
                                component={NavLink}
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
                            <ListItemButton sx={{ gap: 1 }} component={NavLink} to="/contacts" onClick={props.onClick}>
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
                                component={NavLink}
                                to="/explorer/timelines"
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
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        sx={{ gap: 1 }}
                                        component={NavLink}
                                        to="/badges"
                                        onClick={props.onClick}
                                    >
                                        <VerifiedIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary={'バッジ'} />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        sx={{ gap: 1 }}
                                        component={NavLink}
                                        to="/devtool"
                                        onClick={props.onClick}
                                    >
                                        <TerminalIcon
                                            sx={{
                                                color: 'background.contrastText'
                                            }}
                                        />

                                        <ListItemText primary={t('devtool.title')} />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        )}
                        <ListItem disablePadding>
                            <ListItemButton sx={{ gap: 1 }} component={NavLink} to="/settings" onClick={props.onClick}>
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
                    <ListsMenu />
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
                        Concrnt-World 開発中β版
                        <br />
                        <Link
                            underline="hover"
                            color="background.contrastText"
                            href="https://square.concrnt.net/"
                            target="_blank"
                        >
                            ドキュメント
                        </Link>
                        {' / '}
                        <Link
                            underline="hover"
                            color="background.contrastText"
                            href="https://github.com/totegamma/concurrent-world"
                            target="_blank"
                        >
                            GitHub
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
})

Menu.displayName = 'Menu'
