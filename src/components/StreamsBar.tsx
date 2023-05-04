import { useEffect, useState } from 'react'
import {
    lighten,
    Paper,
    IconButton,
    InputBase,
    Box,
    useTheme
} from '@mui/material'
import ExploreIcon from '@mui/icons-material/Explore'
import SearchIcon from '@mui/icons-material/Search'
import {
    Link,
    useNavigate,
    type Location as ReactLocation
} from 'react-router-dom'

export interface StreamsBarProps {
    location: ReactLocation
}

export function StreamsBar(props: StreamsBarProps): JSX.Element {
    const theme = useTheme()
    const navigate = useNavigate()
    const [streams, setStreams] = useState(
        decodeURIComponent(props.location.hash.replace('#', ''))
    )

    // force local streams to change in case of external input (i.e. sidebar button)
    useEffect(() => {
        setStreams(decodeURIComponent(props.location.hash.replace('#', '')))
    }, [props.location.hash])

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: theme.palette.primary.main,
                padding: '5px'
            }}
        >
            <Paper
                component="form"
                elevation={0}
                sx={{
                    m: '3px 30px',
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: '32px',
                    borderRadius: '16px',
                    background: lighten(theme.palette.primary.main, 0.3)
                }}
                onSubmit={(e) => {
                    e.preventDefault()
                    // submit logic (enter key) may be added here
                }}
            >
                <IconButton sx={{ p: '10px' }}>
                    <ExploreIcon sx={{ color: 'white' }} />
                </IconButton>
                <InputBase
                    sx={{ ml: 1, flex: 1, color: '#fff' }}
                    placeholder="following"
                    value={streams}
                    onChange={(e) => {
                        setStreams(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            navigate(`/#${streams}`)
                        }
                    }}
                />
                <IconButton
                    sx={{ p: '10px' }}
                    component={Link}
                    to={`/#${streams}`}
                >
                    <SearchIcon sx={{ color: 'white' }} />
                </IconButton>
            </Paper>
        </Box>
    )
}
