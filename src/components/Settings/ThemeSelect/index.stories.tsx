import type { Meta } from '@storybook/react'
import { useState, useEffect } from 'react'
import type { ConcurrentTheme } from '../../../model'
import { loadConcurrentTheme, Themes } from '../../../themes'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { ThemeSelect } from './index'

const ThemeList = Object.keys(Themes)

interface Props extends Meta {
    themeName: keyof typeof Themes
}

const meta = {
    title: 'Settings/ThemeSelect',
    tags: [],
    argTypes: {
        themeName: {
            options: ThemeList,
            control: { type: 'select' }
        }
    },
    args: {
        themeName: 'basic'
    }
} satisfies Meta<Props>

export default meta

export const Default = (arg: Props): JSX.Element => {
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(arg.themeName ?? 'basic'))

    useEffect(() => {
        setTheme(loadConcurrentTheme(arg.themeName ?? 'basic'))
    }, [arg.themeName])

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <ThemeSelect />
            </CssBaseline>
        </ThemeProvider>
    )
}
