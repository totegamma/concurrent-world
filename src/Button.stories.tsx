import type { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'
import type { ConcurrentTheme } from './model'
import { loadConcurrentTheme, Themes } from './themes'
import { Box, Button, CssBaseline, ThemeProvider } from '@mui/material'
import Paper from '@mui/material/Paper'

const ThemeList = Object.keys(Themes)

interface Props extends Meta {
    themeName: keyof typeof Themes
}

const meta = {
    title: 'Button',
    component: Button,
    tags: [],
    argTypes: {
        themeName: {
            options: ThemeList,
            control: { type: 'select' }
        }
    },
    args: {
        themeName: 'blue'
    }
} satisfies Meta<Props>

export default meta

export const Default = (arg: Props): JSX.Element => {
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(arg.themeName ?? 'blue'))

    useEffect(() => {
        setTheme(loadConcurrentTheme(arg.themeName ?? 'blue'))
    }, [arg.themeName])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Paper sx={{ padding: '1em' }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '1rem'
                    }}
                >
                    <Button>Default</Button>
                    <Button variant="contained">contained</Button>
                    <Button variant="outlined">outlined</Button>
                    <Button disabled={true}>outlined</Button>
                    <Button disabled={true} variant="contained">
                        contained
                    </Button>
                    <Button disabled={true} variant="outlined">
                        outlined
                    </Button>
                </Box>
            </Paper>
        </ThemeProvider>
    )
}
