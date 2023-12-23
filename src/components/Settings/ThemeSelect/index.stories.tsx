import type { Meta } from '@storybook/react'
import { useState, useEffect, useMemo } from 'react'
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
        themeName: 'blue'
    }
} satisfies Meta<Props>

export default meta

export const Default = (arg: Props): JSX.Element => {
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(arg.themeName ?? 'blue'))

    useEffect(() => {
        setTheme(loadConcurrentTheme(arg.themeName ?? 'blue'))
    }, [arg.themeName])

    const previewTheme: Record<string, ConcurrentTheme> = useMemo(
        () => Object.fromEntries(Object.keys(Themes).map((e) => [e, loadConcurrentTheme(e)])),
        []
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <ThemeSelect
                    themes={previewTheme}
                    setThemeName={(name) => {
                        setTheme(loadConcurrentTheme(name))
                    }}
                />
            </CssBaseline>
        </ThemeProvider>
    )
}
