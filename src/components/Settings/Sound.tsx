import { Box, Button, Slider, TextField, Typography } from '@mui/material'
import { defaultPreference, usePreference } from '../../context/PreferenceContext'
import { useTranslation } from 'react-i18next'
import useSound from 'use-sound'
import { useState } from 'react'

const formats = ['wav', 'mp3']

export const SoundSettings = (): JSX.Element => {
    const [pref, setPref] = usePreference('sound')

    const { t } = useTranslation('', { keyPrefix: 'settings.sound' })

    const [postSoundURL, setPostSoundURL] = useState(pref.post)
    const [notificationSoundURL, setNotificationSoundURL] = useState(pref.notification)

    const [previewPostSound] = useSound(postSoundURL, { volume: pref.volume / 100, format: formats })
    const [previewNotificationSound] = useSound(notificationSoundURL, { volume: pref.volume / 100, format: formats })

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
                        setPref({
                            ...pref,
                            volume: value as number
                        })
                    }}
                />
                <Typography variant="h4">{t('override.title')}</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px'
                    }}
                >
                    <TextField
                        fullWidth
                        label={t('override.postSound')}
                        placeholder="https://example.com/sound.mp3"
                        value={postSoundURL}
                        onChange={(e) => {
                            setPref({
                                ...pref,
                                post: e.target.value
                            })
                            setPostSoundURL(e.target.value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            previewPostSound()
                        }}
                    >
                        Test
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px'
                    }}
                >
                    <TextField
                        fullWidth
                        label={t('override.notificationSound')}
                        placeholder="https://example.com/sound.mp3"
                        value={notificationSoundURL}
                        onChange={(e) => {
                            setPref({
                                ...pref,
                                notification: e.target.value
                            })
                            setNotificationSoundURL(e.target.value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            previewNotificationSound()
                        }}
                    >
                        Test
                    </Button>
                </Box>
            </Box>
            <Button
                onClick={() => {
                    setPref(defaultPreference.sound)
                    setPostSoundURL(defaultPreference.sound.post)
                    setNotificationSoundURL(defaultPreference.sound.notification)
                }}
            >
                reset
            </Button>
        </Box>
    )
}
