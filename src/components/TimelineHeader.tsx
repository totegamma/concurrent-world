import { useContext, useEffect, useState } from 'react'
import { Paper, IconButton, Box, useTheme, Button } from '@mui/material'
import ExploreIcon from '@mui/icons-material/Explore'
import InfoIcon from '@mui/icons-material/Info'
import { Link, type Location as ReactLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'

export interface TimelineHeaderProps {
    location: ReactLocation
}

export function TimelineHeader(props: TimelineHeaderProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()

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
                .map((e) => appData.streamDict.get(e))
        ).then((a) => {
            setTitle(
                a
                    .map((e) => e.meta)
                    .filter((e) => e)
                    .map((e) => JSON.parse(e).name)
                    .join(', ')
            )
        })
    }, [props.location.hash])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: theme.palette.primary.main,
                padding: '5px'
            }}
        >
            <Box sx={{ background: 'white' }}></Box>
            <Paper
                component="form"
                elevation={0}
                sx={{
                    m: '3px 30px',
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: { xs: '36px', md: '48px' },
                    borderRadius: '9999px',
                    // background: lighten(theme.palette.primary.main, 0.3)
                    background: 'none'
                }}
                onSubmit={(e) => {
                    e.preventDefault()
                    // submit logic (enter key) may be added here
                }}
            >
                <IconButton sx={{ p: '10px' }} onClick={() => {}}>
                    <ExploreIcon sx={{ color: 'primary.contrastText' }} />
                </IconButton>
                <Button
                    sx={{
                        width: 1,
                        justifyContent: 'flex-start',
                        color: 'primary.contrastText'
                    }}
                >
                    {title}
                </Button>
                <IconButton
                    sx={{ p: '10px' }}
                    component={Link}
                    to={`/info/${props.location.hash}`}
                >
                    <InfoIcon sx={{ color: 'primary.contrastText' }} />
                </IconButton>
            </Paper>
        </Box>
    )
}
