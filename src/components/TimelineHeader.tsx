import { type RefObject, useContext, memo } from 'react'
import { IconButton, Box, useTheme, Button, Zoom, Tooltip } from '@mui/material'
import { ApplicationContext } from '../App'
import { ConcurrentLogo } from './ConcurrentLogo'
import type { ConcurrentTheme } from '../model'

import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'

export interface TimelineHeaderProps {
    scrollParentRef: RefObject<HTMLDivElement>
    title: string
    setMobileMenuOpen: (state: boolean) => void
    mode: 'compose' | 'info'
    setMode: (_: 'compose' | 'info') => void
    writeable: boolean
}

export const TimelineHeader = memo<TimelineHeaderProps>((props: TimelineHeaderProps): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()

    const iconColor = appData.websocketState === 1 ? theme.palette.background.contrastText : theme.palette.text.disabled

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen
    }

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
                        props.setMobileMenuOpen(true)
                    }}
                >
                    <ConcurrentLogo size="25px" upperColor={iconColor} lowerColor={iconColor} frameColor={iconColor} />
                </IconButton>
                <Button
                    sx={{
                        width: 1,
                        justifyContent: {
                            xs: 'flex-left'
                        },
                        color: 'primary.contrastText',
                        p: { xs: '0', xl: '8px 0 8 4px' }
                    }}
                    onClick={() => {
                        props.scrollParentRef.current?.scroll({
                            top: 0,
                            behavior: 'smooth'
                        })
                    }}
                    disableRipple
                >
                    <b>{props.title}</b>
                </Button>
                <Box sx={{ position: 'relative', width: '40px', height: '40px', mr: '8px' }}>
                    <Zoom
                        in={props.mode === 'info'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${props.mode === 'info' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        {props.writeable ? (
                            <IconButton
                                sx={{ p: 1, position: 'absolute' }}
                                onClick={() => {
                                    props.setMode('compose')
                                }}
                            >
                                <CreateIcon sx={{ color: 'primary.contrastText' }} />
                            </IconButton>
                        ) : (
                            <IconButton sx={{ p: 1, position: 'absolute' }}>
                                <Tooltip title="you have no permission to write to this stream" placement="left" arrow>
                                    <CreateIcon sx={{ color: 'disabled' }} />
                                </Tooltip>
                            </IconButton>
                        )}
                    </Zoom>
                    <Zoom
                        in={props.mode === 'compose'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${props.mode === 'compose' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: 1, position: 'absolute' }}
                            onClick={() => {
                                props.setMode('info')
                            }}
                        >
                            <InfoIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                </Box>
            </Box>
        </Box>
    )
})
TimelineHeader.displayName = 'TimelineHeader'
