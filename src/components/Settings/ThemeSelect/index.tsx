import { Box, Button, Paper, Typography, useTheme } from '@mui/material'
import { ConcurrentLogo } from '../../theming/ConcurrentLogo'
import type { ConcurrentTheme } from '../../../model'
import { useEffect, useMemo, useState } from 'react'
import { createConcurrentTheme, Themes } from '../../../themes'
import { usePreference } from '../../../context/PreferenceContext'
import { DummyMessageView } from '../../Message/DummyMessageView'
import { useTranslation } from 'react-i18next'
import { useApi } from '../../../context/api'
import { type User } from '@concurrent-world/client'

export const ThemeSelect = (): JSX.Element => {
    const pref = usePreference()
    const client = useApi()
    const theme = useTheme<ConcurrentTheme>()
    const { t } = useTranslation('', { keyPrefix: 'ui' })
    const previewTheme: Record<string, ConcurrentTheme> = useMemo(
        () => Object.fromEntries(Object.keys(Themes).map((e) => [e, createConcurrentTheme(e)])),
        []
    )

    const [themeAuthor, setThemeAuthor] = useState<User | undefined>(undefined)

    useEffect(() => {
        if (theme.meta?.author) {
            client
                .getUser(theme.meta.author)
                .then((e) => {
                    setThemeAuthor(e ?? undefined)
                })
                .catch((_) => {
                    setThemeAuthor(undefined)
                })
        } else {
            setThemeAuthor(undefined)
        }
    }, [theme])

    return (
        <Box>
            <Box py={1} mb={1}>
                <Typography variant="h3">Current Theme: {pref.themeName}</Typography>
                <Typography variant="h5">Theme Createor:</Typography>
                <Paper
                    sx={{
                        p: 1
                    }}
                    variant="outlined"
                >
                    <DummyMessageView
                        message={{
                            body: theme.meta?.comment ?? 'I made this theme!'
                        }}
                        user={themeAuthor?.profile?.payload.body}
                        timestamp={
                            <Typography
                                sx={{
                                    backgroundColor: 'divider',
                                    color: 'primary.contrastText',
                                    px: 1,
                                    fontSize: '0.75rem'
                                }}
                            >
                                {t('draft.preview')}
                            </Typography>
                        }
                    />
                </Paper>
            </Box>
            <Typography variant="h3">Select Theme:</Typography>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'grid' },
                    flexFlow: 'column',
                    gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
                    gridAutoRows: '1fr',
                    gap: 1
                }}
            >
                {Object.keys(previewTheme).map((e) => (
                    <Paper key={e} variant="outlined">
                        <Button
                            onClick={(_) => {
                                pref.setThemeName(e)
                            }}
                            style={{
                                border: 'none',
                                background: previewTheme[e].palette.background.paper,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                justifyContent: 'flex-start'
                            }}
                            color="info"
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    borderRadius: '100px',
                                    background: previewTheme[e].palette.primary.contrastText
                                }}
                            >
                                <ConcurrentLogo
                                    size="40px"
                                    upperColor={previewTheme[e].palette.primary.main}
                                    lowerColor={previewTheme[e].palette.background.default}
                                    frameColor={previewTheme[e].palette.background.default}
                                />
                            </Box>
                            <Typography
                                sx={{
                                    color: previewTheme[e].palette.text.primary
                                }}
                                variant="button"
                            >
                                {e}
                            </Typography>
                        </Button>
                    </Paper>
                ))}
            </Box>
        </Box>
    )
}
