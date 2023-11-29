import { Divider, Box, Breadcrumbs, Link } from '@mui/material'
import { Route, Routes, useLocation, Link as RouterLink } from 'react-router-dom'
import { SettingsIndex } from '../components/Settings/Index'
import { GeneralSettings } from '../components/Settings/General'
import { ProfileSettings } from '../components/Settings/Profile'
import { ThemeSettings } from '../components/Settings/Theme'
import { SoundSettings } from '../components/Settings/Sound'
import { EmojiSettings } from '../components/Settings/Emoji'
import { MediaSettings } from '../components/Settings/Media'
import { APSettings } from '../components/Settings/APSettings'
import { useTranslation } from 'react-i18next'

export function Settings(): JSX.Element {
    const path = useLocation()

    const { t } = useTranslation('', { keyPrefix: 'pages.settings' })

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Breadcrumbs>
                <Link variant="h2" component={RouterLink} underline="hover" color="text.primary" to="/settings">
                    {t('title')}
                </Link>
                {path.pathname !== '/settings' && (
                    <Link
                        variant="h2"
                        underline="hover"
                        color="inherit"
                        to={path.pathname}
                        component={RouterLink}
                        sx={{
                            textTransform: 'capitalize',
                            color: 'text.primary'
                        }}
                    >
                        {path.pathname.split('/')[2]}
                    </Link>
                )}
            </Breadcrumbs>
            <Divider />
            <Routes>
                <Route path="/" element={<SettingsIndex />} />
                <Route path="/general" element={<GeneralSettings />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/theme" element={<ThemeSettings />} />
                <Route path="/sound" element={<SoundSettings />} />
                <Route path="/emoji" element={<EmojiSettings />} />
                <Route path="/media" element={<MediaSettings />} />
                <Route path="/activitypub" element={<APSettings />} />
            </Routes>
        </Box>
    )
}
