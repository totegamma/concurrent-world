import { Box, Button, Paper, Typography } from '@mui/material'
import { ConcurrentLogo } from '../../ConcurrentLogo'
import type { ConcurrentTheme } from '../../../model'
import { useMemo } from 'react'
import { createConcurrentTheme, Themes } from '../../../themes'

export interface ThemeSelectProp {
    setThemeName: (themeName: string) => void
}

export const ThemeSelect = (props: ThemeSelectProp): JSX.Element => {
    const previewTheme: Record<string, ConcurrentTheme> = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(Themes).map((e) => [e, createConcurrentTheme(e)])
            ),
        []
    )

    return (
        <Box>
            <Typography variant="h3">Theme</Typography>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'grid' },
                    flexFlow: 'column',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gridAutoRows: '1fr',
                    gap: '10px'
                }}
            >
                {Object.keys(previewTheme).map((e) => (
                    <Paper key={e}>
                        <Button
                            onClick={(_) => {
                                props.setThemeName(e)
                            }}
                            style={{
                                border: 'none',
                                background:
                                    previewTheme[e].palette.background.paper,
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
                                    background:
                                        previewTheme[e].palette.primary
                                            .contrastText
                                }}
                            >
                                <ConcurrentLogo
                                    size="40px"
                                    upperColor={
                                        previewTheme[e].palette.primary.main
                                    }
                                    lowerColor={
                                        previewTheme[e].palette.background
                                            .default
                                    }
                                    frameColor={
                                        previewTheme[e].palette.background
                                            .default
                                    }
                                />
                            </Box>
                            <Typography
                                sx={{
                                    color: previewTheme[e].palette.text.primary
                                }}
                                variant="button"
                            >
                                {e}
                            </Typography>
                        </Button>
                    </Paper>
                ))}
            </Box>
        </Box>
    )
}
