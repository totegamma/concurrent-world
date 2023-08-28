import { Box, Slider, TextField, Typography } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'

export const SoundSettings = (): JSX.Element => {
    const pref = usePreference()

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}
        >
            <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h3">サウンド</Typography>
                <Typography variant="h4">音量</Typography>
                <Slider
                    aria-label="Volume"
                    value={pref.volume}
                    onChange={(_, value) => {
                        pref.setVolume(value as number)
                    }}
                />
                <Typography variant="h4">Override</Typography>
                <TextField
                    label="投稿音"
                    placeholder="https://example.com/sound.mp3"
                    value={pref.postSound}
                    onChange={(e) => {
                        pref.setPostSound(e.target.value)
                    }}
                />
                <TextField
                    label="通知音"
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
