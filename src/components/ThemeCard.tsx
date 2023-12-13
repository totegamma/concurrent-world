import { Box, Button, IconButton, Paper, Typography } from '@mui/material'
import { type ConcurrentTheme } from '../model'
import { ConcurrentLogo } from './theming/ConcurrentLogo'
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline'
import { usePreference } from '../context/PreferenceContext'

export interface ThemeCardProps {
    theme: ConcurrentTheme
}

export const ThemeCard = (props: ThemeCardProps): JSX.Element => {
    const [_, setThemeName] = usePreference('themeName')
    const [customThemes, setCustomThemes] = usePreference('customThemes')

    return (
        <Paper variant="outlined">
            <Button
                style={{
                    border: 'none',
                    background: props.theme.palette.background.paper,
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
                        background: props.theme.palette.primary.contrastText
                    }}
                >
                    <ConcurrentLogo
                        size="40px"
                        upperColor={props.theme.palette.primary.main}
                        lowerColor={props.theme.palette.background.default}
                        frameColor={props.theme.palette.background.default}
                    />
                </Box>
                <Typography
                    sx={{
                        color: props.theme.palette.text.primary,
                        flexGrow: 1
                    }}
                    variant="button"
                >
                    {props.theme.meta?.name}
                </Typography>
                <IconButton
                    onClick={() => {
                        if (!props.theme.meta?.name) return
                        setThemeName(props.theme.meta.name)
                        setCustomThemes({
                            ...customThemes,
                            [props.theme.meta.name]: props.theme
                        })
                    }}
                    sx={{
                        color: props.theme.palette.text.primary
                    }}
                >
                    <DownloadForOfflineIcon />
                </IconButton>
            </Button>
        </Paper>
    )
}
