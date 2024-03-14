import { Divider, Box } from '@mui/material'
import { Route, Routes } from 'react-router-dom'
import { SettingsIndex } from '../components/Settings/Index'
import { GeneralSettings } from '../components/Settings/General'
import { ProfileSettings } from '../components/Settings/Profile'
import { ThemeSettings } from '../components/Settings/Theme'
import { SoundSettings } from '../components/Settings/Sound'
import { EmojiSettings } from '../components/Settings/Emoji'
import { MediaSettings } from '../components/Settings/Media'
import { LoginQR } from '../components/Settings/LoginQR'
import { APSettings } from '../components/Settings/APSettings'
import { IdentitySettings } from '../components/Settings/Identity'
import { BreadcrumbList } from '../components/ui/BreadcrumbList'

export function Settings(): JSX.Element {
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
            <BreadcrumbList />
            <Divider />
            <Routes>
                <Route path="/" element={<SettingsIndex />} />
                <Route path="/general" element={<GeneralSettings />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/identity" element={<IdentitySettings />} />
                <Route path="/theme" element={<ThemeSettings />} />
                <Route path="/sound" element={<SoundSettings />} />
                <Route path="/emoji" element={<EmojiSettings />} />
                <Route path="/media" element={<MediaSettings />} />
                <Route path="/activitypub" element={<APSettings />} />
                <Route path="/loginqr" element={<LoginQR />} />
            </Routes>
        </Box>
    )
}
