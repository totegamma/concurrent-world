import { Box, Button, Paper, Typography } from '@mui/material'
import { ConcurrentLogo } from '../../theming/ConcurrentLogo'
import type { ConcurrentTheme } from '../../../model'

export interface ThemeSelectProps {
    themes: Record<string, ConcurrentTheme>
    setThemeName: (name: string) => void
}

export const ThemeSelect = (props: ThemeSelectProps): JSX.Element => {
    return (
        <Box
            sx={{
                display: { xs: 'flex', md: 'grid' },
                flexFlow: 'column',
                gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
                gridAutoRows: '1fr',
                gap: 1
            }}
        >
            {Object.keys(props.themes).map((e) => (
                <Paper key={e} variant="outlined">
                    <Button
                        onClick={(_) => {
                            props.setThemeName(e)
                        }}
                        style={{
                            border: 'none',
                            background: props.themes[e].palette.background.paper,
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
                                background: props.themes[e].palette.primary.contrastText
                            }}
                        >
                            <ConcurrentLogo
                                size="40px"
                                upperColor={props.themes[e].palette.primary.main}
                                lowerColor={props.themes[e].palette.background.default}
                                frameColor={props.themes[e].palette.background.default}
                            />
                        </Box>
                        <Typography
                            sx={{
                                color: props.themes[e].palette.text.primary
                            }}
                            variant="button"
                        >
                            {e}
                        </Typography>
                    </Button>
                </Paper>
            ))}
        </Box>
    )
}
