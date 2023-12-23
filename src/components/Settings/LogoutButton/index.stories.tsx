import type { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'
import type { ConcurrentTheme } from '../../../model'
import { loadConcurrentTheme, Themes } from '../../../themes'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LogoutButton } from './index'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const ThemeList = Object.keys(Themes)

interface Props extends Meta {
    themeName: keyof typeof Themes
}

const meta = {
    title: 'Settings/LogOutButton',
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
        <BrowserRouter>
            <Routes>
                <Route
                    path="*"
                    element={
                        <ThemeProvider theme={theme}>
                            <CssBaseline>
                                <LogoutButton />
                            </CssBaseline>
                        </ThemeProvider>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}
