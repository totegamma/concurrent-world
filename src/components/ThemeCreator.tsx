import { Box, Button, Divider, Paper, TextField, ThemeProvider, Typography, useTheme } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { type ConcurrentTheme } from '../model'
import { createConcurrentThemeFromObject } from '../themes'
import { ConcurrentLogo } from './theming/ConcurrentLogo'
import { usePreference } from '../context/PreferenceContext'
import { useApi } from '../context/api'

export const ThemeCreator = (): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const theme = useTheme<ConcurrentTheme>()

    const [title, setTitle] = useState(pref.customTheme?.meta?.name ?? theme.meta?.name ?? 'My Theme')

    const [contentBackground, setContentBackground] = useState(theme.palette.background.paper)
    const [contentText, setContentText] = useState(theme.palette.text.primary)
    const [contentLink, setContentLink] = useState(theme.palette.text.secondary)

    const [uiBackground, setUiBackground] = useState(theme.palette.primary.main)
    const [uiText, setUiText] = useState(theme.palette.primary.contrastText)

    const [underlayBackground, setUnderlayBackground] = useState(theme.palette.background.default)
    const [underlayText, setUnderlayText] = useState(theme.palette.background.contrastText)

    useEffect(() => {
        setTitle(theme.meta?.name ?? 'My Theme')
        setContentBackground(pref.customTheme?.palette?.background?.paper ?? theme.palette.background.paper)
        setContentText(pref.customTheme?.palette?.text?.primary ?? theme.palette.text.primary)
        setContentLink(pref.customTheme?.palette?.text?.secondary ?? theme.palette.text.secondary)
        setUiBackground(pref.customTheme?.palette?.primary?.main ?? theme.palette.primary.main)
        setUiText(pref.customTheme?.palette?.primary?.contrastText ?? theme.palette.primary.contrastText)
        setUnderlayBackground(pref.customTheme?.palette?.background?.default ?? theme.palette.background.default)
        setUnderlayText(pref.customTheme?.palette?.background?.contrastText ?? theme.palette.background.contrastText)
    }, [theme])

    const newTheme = useMemo(
        () =>
            createConcurrentThemeFromObject({
                meta: {
                    name: title,
                    author: client.user?.ccid
                },
                palette: {
                    primary: {
                        main: uiBackground,
                        contrastText: uiText
                    },
                    secondary: {
                        main: contentLink
                    },
                    background: {
                        default: underlayBackground,
                        paper: contentBackground,
                        contrastText: underlayText
                    },
                    text: {
                        primary: contentText,
                        secondary: contentLink
                    }
                }
            }),
        [contentBackground, contentLink, contentText, uiBackground, uiText, underlayBackground, underlayText]
    )

    const serialized = useMemo(
        () =>
            [contentBackground, contentLink, contentText, uiBackground, uiText, underlayBackground, underlayText].join(
                ','
            ),
        [contentBackground, contentLink, contentText, uiBackground, uiText, underlayBackground, underlayText]
    )

    return (
        <ThemeProvider theme={newTheme}>
            <Box display="flex" flexDirection="column" gap={1}>
                <Paper
                    variant="outlined"
                    sx={{
                        width: '100%'
                    }}
                >
                    <Box p={2} display="flex" flexDirection="row" alignItems="center" gap={2}>
                        <ConcurrentLogo
                            size="50px"
                            upperColor={newTheme.palette.primary.main}
                            lowerColor={newTheme.palette.background.default}
                            frameColor={newTheme.palette.background.default}
                        />
                        <TextField
                            fullWidth
                            placeholder="Theme Name"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value)
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                height: '50px'
                            }}
                            onClick={() => {
                                pref.setCustomTheme(newTheme)
                            }}
                        >
                            Apply
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: 'background.paper',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'text.primary'} variant="h1">
                                    Content
                                </Typography>
                                <Typography color={'text.secondary'} variant="h2">
                                    Link
                                </Typography>
                            </Box>
                            <Divider />
                            <TextField
                                label="Text"
                                value={contentText}
                                onChange={(e) => {
                                    setContentText(e.target.value)
                                }}
                            />
                            <TextField
                                label="Link"
                                value={contentLink}
                                onChange={(e) => {
                                    setContentLink(e.target.value)
                                }}
                            />
                            <TextField
                                label="Background"
                                value={contentBackground}
                                onChange={(e) => {
                                    setContentBackground(e.target.value)
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'primary.contrastText'} variant="h1">
                                    UI
                                </Typography>
                            </Box>
                            <Divider />
                            <TextField
                                label="Text"
                                value={uiText}
                                onChange={(e) => {
                                    setUiText(e.target.value)
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: 'primary.contrastText'
                                    },
                                    '& label': {
                                        color: 'primary.contrastText'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            color: 'primary.contrastText'
                                        },
                                        '&:hover fieldset': {
                                            color: 'primary.contrastText'
                                        },
                                        '&.Mui-focused fieldset': {
                                            color: 'primary.contrastText'
                                        }
                                    }
                                }}
                            />
                            <TextField
                                label="Background"
                                value={uiBackground}
                                onChange={(e) => {
                                    setUiBackground(e.target.value)
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: 'primary.contrastText'
                                    },
                                    '& label': {
                                        color: 'primary.contrastText'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            color: 'primary.contrastText'
                                        },
                                        '&:hover fieldset': {
                                            color: 'primary.contrastText'
                                        },
                                        '&.Mui-focused fieldset': {
                                            color: 'primary.contrastText'
                                        }
                                    }
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'background.default',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'background.contrastText'} variant="h1">
                                    Underlay
                                </Typography>
                            </Box>
                            <Divider />
                            <TextField
                                label="Text"
                                value={underlayText}
                                onChange={(e) => {
                                    setUnderlayText(e.target.value)
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: 'background.contrastText'
                                    },
                                    '& label': {
                                        color: 'background.contrastText'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'background.contrastText'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'background.contrastText'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'background.contrastText'
                                        }
                                    }
                                }}
                            />
                            <TextField
                                label="Background"
                                value={underlayBackground}
                                onChange={(e) => {
                                    setUnderlayBackground(e.target.value)
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: 'background.contrastText'
                                    },
                                    '& label': {
                                        color: 'background.contrastText'
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'background.contrastText'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'background.contrastText'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'background.contrastText'
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </Paper>
                <TextField
                    fullWidth
                    multiline
                    value={serialized}
                    onChange={(e) => {
                        const [
                            contentBackground,
                            contentLink,
                            contentText,
                            uiBackground,
                            uiText,
                            underlayBackground,
                            underlayText
                        ] = e.target.value.split(',')
                        setContentBackground(contentBackground)
                        setContentLink(contentLink)
                        setContentText(contentText)
                        setUiBackground(uiBackground)
                        setUiText(uiText)
                        setUnderlayBackground(underlayBackground)
                        setUnderlayText(underlayText)
                    }}
                />
            </Box>
        </ThemeProvider>
    )
}
