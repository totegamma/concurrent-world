import {
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Popover,
    TextField,
    ThemeProvider,
    Typography,
    useTheme
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { type ConcurrentTheme } from '../model'
import { createConcurrentThemeFromObject } from '../themes'
import { ConcurrentLogo } from './theming/ConcurrentLogo'
import { usePreference } from '../context/PreferenceContext'
import { useApi } from '../context/api'
import { HexColorPicker } from 'react-colorful'
import ColorizeIcon from '@mui/icons-material/Colorize'

export interface ColorPickerProps {
    label: string
    value: string
    onChange: (value: string) => void
    color: string
}

export const ColorPicker = (props: ColorPickerProps): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    return (
        <Box>
            <TextField
                label={props.label}
                value={props.value}
                onChange={(e) => {
                    props.onChange(e.target.value)
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        color: props.color
                    },
                    '& label': {
                        color: props.color
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            color: props.color
                        },
                        '&:hover fieldset': {
                            color: props.color
                        },
                        '&.Mui-focused fieldset': {
                            color: props.color
                        }
                    }
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle color picker"
                                onClick={(e) => {
                                    setAnchorEl(e.currentTarget)
                                }}
                            >
                                <ColorizeIcon sx={{ color: props.color }} />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null)
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                sx={{
                    '& .MuiPaper-root': {
                        bgcolor: 'transparent',
                        overflow: 'hidden'
                    }
                }}
            >
                <HexColorPicker
                    color={props.value}
                    onChange={(color) => {
                        props.onChange(color)
                    }}
                />
            </Popover>
        </Box>
    )
}

export const ThemeCreator = (): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const theme = useTheme<ConcurrentTheme>()

    const [title, setTitle] = useState(pref.customTheme?.meta?.name ?? theme.meta?.name ?? 'My Theme')

    const [contentBackground, setContentBackground] = useState(theme.palette.background.paper)
    const [contentText, setContentText] = useState(theme.palette.text.primary)
    const [contentLink, setContentLink] = useState(theme.palette.text.secondary)

    const [uiBackground, setUiBackground] = useState(theme.palette.primary.main)
    const [uiText, setUiText] = useState(theme.palette.primary.contrastText)

    const [underlayBackground, setUnderlayBackground] = useState(theme.palette.background.default)
    const [underlayText, setUnderlayText] = useState(theme.palette.background.contrastText)

    const [newThemeBase, setNewThemeBase] = useState<any>(pref.customTheme ?? theme)

    const newTheme = useMemo(() => {
        return createConcurrentThemeFromObject(newThemeBase)
    }, [newThemeBase])

    useEffect(() => {
        setTitle(theme.meta?.name ?? 'My Theme')
        setContentBackground(pref.customTheme?.palette?.background?.paper ?? theme.palette.background.paper)
        setContentText(pref.customTheme?.palette?.text?.primary ?? theme.palette.text.primary)
        setContentLink(pref.customTheme?.palette?.text?.secondary ?? theme.palette.text.secondary)
        setUiBackground(pref.customTheme?.palette?.primary?.main ?? theme.palette.primary.main)
        setUiText(pref.customTheme?.palette?.primary?.contrastText ?? theme.palette.primary.contrastText)
        setUnderlayBackground(pref.customTheme?.palette?.background?.default ?? theme.palette.background.default)
        setUnderlayText(pref.customTheme?.palette?.background?.contrastText ?? theme.palette.background.contrastText)
    }, [theme])

    const validateColor = (color: string): boolean => {
        // The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
        const regex = /(#[a-zA-Z0-9]{3,6}|(rgb|rgba|hsl|hsla|color)\((\s*\d+(\.\d+)?,?){3,4}\))/i
        return regex.test(color)
    }
    useEffect(() => {
        setNewThemeBase({
            meta: {
                name: title,
                author: client.user?.ccid
            },
            palette: {
                primary: {
                    main: validateColor(uiBackground) ? uiBackground : newThemeBase?.palette.primary.main,
                    contrastText: validateColor(uiText) ? uiText : newThemeBase?.palette.primary.contrastText
                },
                secondary: {
                    main: validateColor(contentLink) ? contentLink : newThemeBase?.palette.secondary.main
                },
                background: {
                    default: validateColor(underlayBackground)
                        ? underlayBackground
                        : newThemeBase?.palette.background.default,
                    paper: validateColor(contentBackground)
                        ? contentBackground
                        : newThemeBase?.palette.background.paper,
                    contrastText: validateColor(underlayText)
                        ? underlayText
                        : newThemeBase?.palette.background.contrastText
                },
                text: {
                    primary: validateColor(contentText) ? contentText : newThemeBase?.palette.text.primary,
                    secondary: validateColor(contentLink) ? contentLink : newThemeBase?.palette.text.secondary
                }
            }
        })
    }, [contentBackground, contentLink, contentText, uiBackground, uiText, underlayBackground, underlayText])

    const serialized = useMemo(() => {
        const colors = [
            contentBackground,
            contentLink,
            contentText,
            uiBackground,
            uiText,
            underlayBackground,
            underlayText
        ]
        if (colors.some((color) => !validateColor(color))) {
            return ''
        }
        return colors.join(';')
    }, [contentBackground, contentLink, contentText, uiBackground, uiText, underlayBackground, underlayText])

    return (
        <ThemeProvider theme={newTheme}>
            <Box display="flex" flexDirection="column" gap={1}>
                <Paper
                    variant="outlined"
                    sx={{
                        width: '100%'
                    }}
                >
                    <Box p={2} display="flex" flexDirection="row" alignItems="center" gap={2}>
                        <ConcurrentLogo
                            size="50px"
                            upperColor={newTheme.palette.primary.main}
                            lowerColor={newTheme.palette.background.default}
                            frameColor={newTheme.palette.background.default}
                        />
                        <TextField
                            fullWidth
                            placeholder="Theme Name"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value)
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                height: '50px'
                            }}
                            onClick={() => {
                                pref.setCustomTheme(newThemeBase)
                            }}
                        >
                            Apply
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: 'background.paper',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'text.primary'} variant="h1">
                                    Content
                                </Typography>
                                <Typography color={'text.secondary'} variant="h2">
                                    Link
                                </Typography>
                            </Box>
                            <Divider />

                            <ColorPicker
                                label="Text"
                                value={contentText}
                                onChange={setContentText}
                                color={'text.primary'}
                            />

                            <ColorPicker
                                label="Link"
                                value={contentLink}
                                onChange={setContentLink}
                                color={'text.primary'}
                            />

                            <ColorPicker
                                label="Background"
                                value={contentText}
                                onChange={setContentBackground}
                                color={'text.primary'}
                            />
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'primary.contrastText'} variant="h1">
                                    UI
                                </Typography>
                            </Box>
                            <Divider />

                            <ColorPicker
                                label="Text"
                                value={uiText}
                                onChange={setUiText}
                                color={'primary.contrastText'}
                            />

                            <ColorPicker
                                label="Background"
                                value={uiBackground}
                                onChange={setUiBackground}
                                color={'primary.contrastText'}
                            />
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'background.default',
                                flexGrow: 1,
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Box height={70}>
                                <Typography color={'background.contrastText'} variant="h1">
                                    Underlay
                                </Typography>
                            </Box>
                            <Divider />

                            <ColorPicker
                                label="Text"
                                value={underlayText}
                                onChange={setUnderlayText}
                                color={'background.contrastText'}
                            />

                            <ColorPicker
                                label="Background"
                                value={underlayBackground}
                                onChange={setUnderlayBackground}
                                color={'background.contrastText'}
                            />
                        </Box>
                    </Box>
                </Paper>
                <TextField
                    fullWidth
                    multiline
                    value={serialized}
                    onChange={(e) => {
                        const [
                            contentBackground,
                            contentLink,
                            contentText,
                            uiBackground,
                            uiText,
                            underlayBackground,
                            underlayText
                        ] = e.target.value.split(';')
                        setContentBackground(contentBackground)
                        setContentLink(contentLink)
                        setContentText(contentText)
                        setUiBackground(uiBackground)
                        setUiText(uiText)
                        setUnderlayBackground(underlayBackground)
                        setUnderlayText(underlayText)
                    }}
                />
            </Box>
        </ThemeProvider>
    )
}
