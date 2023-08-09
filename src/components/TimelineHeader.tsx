import { useContext, memo } from 'react'
import { IconButton, Box, useTheme, Button } from '@mui/material'
import { ApplicationContext } from '../App'
import { ConcurrentLogo } from './theming/ConcurrentLogo'
import type { ConcurrentTheme } from '../model'
import { useGlobalActions } from '../context/GlobalActions'

export interface TimelineHeaderProps {
    title?: string
    titleIcon?: JSX.Element
    onTitleClick?: () => void
    secondaryAction?: JSX.Element
    onSecondaryActionClick?: () => void
    useRawSecondaryAction?: boolean
}

export const TimelineHeader = memo<TimelineHeaderProps>((props: TimelineHeaderProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()
    const actions = useGlobalActions()

    const iconColor = appData.websocketState === 1 ? theme.palette.background.contrastText : theme.palette.text.disabled

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: theme.palette.primary.main
            }}
        >
            <Box sx={{ background: 'white' }}></Box>
            <Box
                sx={{
                    p: { xs: '', sm: '2px 2px 2px 16px' },
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '9999px',
                    background: 'none'
                }}
            >
                <IconButton
                    sx={{
                        p: '8px',
                        display: { xs: 'inherit', sm: 'none' }
                    }}
                    onClick={() => {
                        actions.openMobileMenu(true)
                    }}
                >
                    <ConcurrentLogo size="25px" upperColor={iconColor} lowerColor={iconColor} frameColor={iconColor} />
                </IconButton>
                <Button
                    sx={{
                        width: 1,
                        color: 'primary.contrastText'
                    }}
                    onClick={props.onTitleClick}
                    disableRipple
                >
                    {props.titleIcon}
                    <b>{props.title}</b>
                </Button>
                <Box sx={{ position: 'relative', width: '40px', height: '40px', mr: '8px' }}>
                    {props.useRawSecondaryAction ? (
                        props.secondaryAction
                    ) : (
                        <IconButton
                            sx={{
                                p: 1,
                                position: 'absolute',
                                color: 'primary.contrastText'
                            }}
                            onClick={props.onSecondaryActionClick}
                        >
                            {props.secondaryAction}
                        </IconButton>
                    )}
                </Box>
            </Box>
        </Box>
    )
})
TimelineHeader.displayName = 'TimelineHeader'
