import Box from '@mui/material/Box'
import { createConcurrentTheme } from '../themes'
import { Button, ThemeProvider, Typography, darken } from '@mui/material'
import { ConcurrentLogo } from '../components/ConcurrentLogo'

export function Welcome(): JSX.Element {
    const theme = createConcurrentTheme('blue2')

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    width: '100vw',
                    height: '100dvh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    background: [
                        theme.palette.background.default,
                        `linear-gradient(${
                            theme.palette.background.default
                        }, ${darken(theme.palette.background.default, 0.1)})`
                    ]
                }}
            >
                <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                    <Box>
                        <ConcurrentLogo
                            size="64px"
                            upperColor={theme.palette.background.contrastText}
                            lowerColor={theme.palette.background.contrastText}
                            frameColor={theme.palette.background.contrastText}
                        />
                    </Box>
                    <Typography
                        sx={{
                            color: 'background.contrastText',
                            fontSize: '64px'
                        }}
                    >
                        Concurrent
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        color: 'background.contrastText',
                        fontSize: '32px',
                        mb: '30px'
                    }}
                >
                    世界は一つ、環境は無数。
                </Typography>
                <Box sx={{ display: 'flex', gap: '30px' }}>
                    <Button variant="contained">新しくはじめる</Button>{' '}
                    <Button variant="contained">アカウントインポート</Button>
                </Box>
            </Box>
        </ThemeProvider>
    )
}
