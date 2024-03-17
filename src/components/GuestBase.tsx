import { useState } from 'react'
import { Themes, loadConcurrentTheme } from '../themes'
import { type ConcurrentTheme } from '../model'
import { ThemeProvider } from '@emotion/react'
import { Box, Button, CssBaseline, type SxProps, darken } from '@mui/material'
import { ConcurrentWordmark } from './theming/ConcurrentWordmark'
import { Link } from 'react-router-dom'

export interface GuestBaseProps {
    children: JSX.Element | JSX.Element[]
    sx?: SxProps
    additionalButton?: JSX.Element
}

export const GuestBase = (props: GuestBaseProps): JSX.Element => {
    const [themeName, setThemeName] = useState<string>('blue')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName))

    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(loadConcurrentTheme(newThemeName))
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    background: theme.palette.background.default,
                    minWidth: '100vw',
                    minHeight: '100dvh'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        maxWidth: '1280px',
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexFlow: 'column',
                            flex: 1
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" mt={2} mx={2}>
                            <Button
                                disableRipple
                                variant="text"
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    textTransform: 'none',
                                    '&:hover': {
                                        background: 'none'
                                    }
                                }}
                                component={Link}
                                to="/welcome"
                            >
                                <ConcurrentWordmark color={theme.palette.background.contrastText} />
                            </Button>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1
                                }}
                            >
                                <Button onClick={randomTheme}>✨</Button>
                                {props.additionalButton}
                            </Box>
                        </Box>
                        <Box sx={props.sx}>{props.children}</Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    )
}
