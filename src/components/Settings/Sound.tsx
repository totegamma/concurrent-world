import { Box, Slider, TextField, Typography } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import { useTranslation } from 'react-i18next'

export const SoundSettings = (): JSX.Element => {
    const pref = usePreference()

    const { t } = useTranslation('', { keyPrefix: 'settings.sound' })

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}
        >
            <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h3">{t('sound')}</Typography>
                <Typography variant="h4">{t('volume')}</Typography>
                <Slider
                    aria-label="Volume"
                    value={pref.volume}
                    onChange={(_, value) => {
                        pref.setVolume(value as number)
                    }}
                />
                <Typography variant="h4">{t('override.title')}</Typography>
                <TextField
                    label={t('override.postSound')}
                    placeholder="https://example.com/sound.mp3"
                    value={pref.postSound}
                    onChange={(e) => {
                        pref.setPostSound(e.target.value)
                    }}
                />
                <TextField
                    label={t('override.notificationSound')}
                    placeholder="https://example.com/sound.mp3"
                    value={pref.notificationSound}
                    onChange={(e) => {
                        pref.setNotificationSound(e.target.value)
                    }}
                />
            </Box>
        </Box>
    )
}
