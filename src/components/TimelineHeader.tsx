import { type RefObject, useContext, useEffect, useState, memo } from 'react'
import { IconButton, Box, useTheme, Button, Zoom } from '@mui/material'
import { type Location as ReactLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'
import { ConcurrentLogo } from './ConcurrentLogo'
import type { ConcurrentTheme } from '../model'
import { useApi } from '../context/api'

import InfoIcon from '@mui/icons-material/Info'
import CreateIcon from '@mui/icons-material/Create'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'

export interface TimelineHeaderProps {
    location: ReactLocation
    scrollParentRef: RefObject<HTMLDivElement>
    setMobileMenuOpen: (state: boolean) => void
    mode: string
    setMode: (_: string) => void
}

export const TimelineHeader = memo<TimelineHeaderProps>((props: TimelineHeaderProps): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()

    const [title, setTitle] = useState<string>('')

    useEffect(() => {
        if (!props.location.hash || props.location.hash === '#') {
            setTitle('Home')
            return
        }
        Promise.all(
            props.location.hash
                .replace('#', '')
                .split(',')
                .map((e) => api.readStream(e))
        ).then((a) => {
            setTitle(
                a
                    .map((e) => e?.payload.body.name)
                    .filter((e) => e)
                    .join(', ')
            )
        })
    }, [props.location.hash])

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
                            xs: 'flex-left',
                            xl: 'flex-start'
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
                    <b>{title}</b>
                </Button>
                <Box sx={{ position: 'relative', width: '40px', height: '40px' }}>
                    <Zoom
                        in={props.mode === 'info'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${props.mode === 'info' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                props.setMode('compose')
                            }}
                        >
                            <CreateIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
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
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                props.setMode('info')
                            }}
                        >
                            <InfoIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={props.mode === 'home'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${props.mode === 'home' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                props.setMode('edit')
                            }}
                        >
                            <PlaylistAddIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                    <Zoom
                        in={props.mode === 'edit'}
                        timeout={transitionDuration}
                        style={{
                            transitionDelay: `${props.mode === 'edit' ? transitionDuration.exit : 0}ms`
                        }}
                        unmountOnExit
                    >
                        <IconButton
                            sx={{ p: '8px', position: 'absolute' }}
                            onClick={() => {
                                props.setMode('home')
                            }}
                        >
                            <CreateIcon sx={{ color: 'primary.contrastText' }} />
                        </IconButton>
                    </Zoom>
                </Box>
            </Box>
        </Box>
    )
})
TimelineHeader.displayName = 'TimelineHeader'
