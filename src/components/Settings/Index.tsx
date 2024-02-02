import { Typography, Box, ButtonBase, Button, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { CCAvatar } from '../ui/CCAvatar'
import { useApi } from '../../context/api'
import SettingsIcon from '@mui/icons-material/Settings'
import PaletteIcon from '@mui/icons-material/Palette'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import PhotoIcon from '@mui/icons-material/Photo'
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet'
import { useSnackbar } from 'notistack'
import { LogoutButton } from './LogoutButton'
import { IconButtonWithLabel } from '../ui/IconButtonWithLabel'
import { useTranslation } from 'react-i18next'

export function SettingsIndex(): JSX.Element {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()

    const { t } = useTranslation('', { keyPrefix: '' })

    const deleteAllCache = (): void => {
        if (window.caches) {
            caches.keys().then((names) => {
                // Delete all the cache files
                names.forEach((name) => {
                    caches.delete(name)
                })
            })
            enqueueSnackbar('Cache deleted', { variant: 'success' })
        } else {
            enqueueSnackbar('No cache to delete', { variant: 'info' })
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            <Box /* header */ display="flex" flexDirection="row" justifyContent="space-between" width="100%">
                <ButtonBase
                    component={RouterLink}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        gap: 1
                    }}
                    to={'/settings/profile'}
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
                <Button
                    onClick={(_) => {
                        if (client.api.host === undefined) {
                            return
                        }
                        window.open(
                            `https://${client.api.host}/web/login?token=${client.api.generateApiToken()}`,
                            '_blank',
                            'noreferrer'
                        )
                    }}
                >
                    Goto Domain Home
                </Button>
            </Box>
            <Paper /* menu */
                variant="outlined"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: 1,
                    padding: 1
                }}
            >
                <IconButtonWithLabel
                    link
                    icon={SettingsIcon}
                    label={t('settings.general.title')}
                    to="/settings/general"
                />
                <IconButtonWithLabel
                    link
                    icon={AccountCircleIcon}
                    label={t('settings.profile.title')}
                    to="/settings/profile"
                />
                <IconButtonWithLabel link icon={PaletteIcon} label={t('settings.theme.title')} to="/settings/theme" />
                <IconButtonWithLabel link icon={VolumeUpIcon} label={t('settings.sound.title')} to="/settings/sound" />
                <IconButtonWithLabel
                    link
                    icon={EmojiEmotionsIcon}
                    label={t('settings.emoji.title')}
                    to="/settings/emoji"
                />
                <IconButtonWithLabel link icon={PhotoIcon} label={t('settings.media.title')} to="/settings/media" />
                <IconButtonWithLabel
                    link
                    icon={SettingsEthernetIcon}
                    label={t('settings.ap.title')}
                    to="/settings/activitypub"
                />
            </Paper>
            <Paper
                variant="outlined"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    padding: 1
                }}
            >
                <Typography variant="h2" gutterBottom>
                    {t('pages.settings.actions.title')}
                </Typography>
                <Button
                    onClick={(_) => {
                        deleteAllCache()
                    }}
                >
                    {t('pages.settings.actions.clearCache')}
                </Button>
                <Button
                    onClick={(_) => {
                        window.location.reload()
                    }}
                >
                    {t('pages.settings.actions.forceReload')}
                </Button>
                <LogoutButton />
            </Paper>
        </Box>
    )
}
