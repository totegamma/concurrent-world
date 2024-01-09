import { Box, Button, IconButton, Paper, Typography } from '@mui/material'
import { type ConcurrentTheme } from '../model'
import { ConcurrentLogo } from './theming/ConcurrentLogo'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'
import { usePreference } from '../context/PreferenceContext'
import { closeSnackbar, useSnackbar } from 'notistack'
import { createConcurrentThemeFromObject } from '../themes'

export interface ThemeCardProps {
    theme: ConcurrentTheme
}

export const ThemeCard = (props: ThemeCardProps): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar()
    const [themeName, setThemeName] = usePreference('themeName')
    const [customThemes, setCustomThemes] = usePreference('customThemes')

    const theme = createConcurrentThemeFromObject(props.theme)

    const bgColor =
        theme.components?.MuiAppBar?.defaultProps?.color === 'transparent'
            ? theme.palette.background.paper
            : theme.palette.primary.contrastText

    return (
        <Paper variant="outlined">
            <Button
                style={{
                    border: 'none',
                    background: theme.palette.background.paper,
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
                        background: bgColor
                    }}
                >
                    <ConcurrentLogo
                        size="40px"
                        upperColor={theme.palette.primary.main}
                        lowerColor={theme.palette.background.default}
                        frameColor={theme.palette.background.default}
                    />
                </Box>
                <Typography
                    sx={{
                        color: theme.palette.text.primary,
                        flexGrow: 1,
                        textTransform: 'none'
                    }}
                    variant="button"
                >
                    {theme.meta?.name}
                </Typography>
                <IconButton
                    onClick={() => {
                        if (!props.theme.meta?.name) return
                        enqueueSnackbar(`Theme downloaded: ${props.theme.meta.name}`, {
                            autoHideDuration: 15000,
                            action: (key) => (
                                <Button
                                    onClick={() => {
                                        setThemeName(themeName)
                                        closeSnackbar(key)
                                    }}
                                >
                                    Undo
                                </Button>
                            )
                        })
                        setThemeName(props.theme.meta.name)
                        setCustomThemes({
                            ...customThemes,
                            [props.theme.meta.name]: props.theme
                        })
                    }}
                    sx={{
                        color: theme.palette.text.primary
                    }}
                >
                    <DownloadForOfflineIcon />
                </IconButton>
            </Button>
        </Paper>
    )
}
