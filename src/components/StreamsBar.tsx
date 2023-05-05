import { useContext, useEffect, useState } from 'react'
import {
    Paper,
    IconButton,
    InputBase,
    Box,
    useTheme,
    Autocomplete,
    Chip
} from '@mui/material'
import ExploreIcon from '@mui/icons-material/Explore'
import SearchIcon from '@mui/icons-material/Search'
import {
    Link,
    useNavigate,
    type Location as ReactLocation
} from 'react-router-dom'
import { ApplicationContext } from '../App'

export interface StreamsBarProps {
    location: ReactLocation
}

export function StreamsBar(props: StreamsBarProps): JSX.Element {
    const theme = useTheme()
    const navigate = useNavigate()
    const [streams, setStreams] = useState(
        decodeURIComponent(props.location.hash.replace('#', ''))
    )

    const [allStreams, setAllStreams] = useState<string[]>([])
    const appData = useContext(ApplicationContext)

    useEffect(() => {
        fetch(appData.serverAddress + 'stream/list').then((data) => {
            data.json().then((json) => {
                setAllStreams(json)
            })
        })
    }, [])

    // force local streams to change in case of external input (i.e. sidebar button)
    useEffect(() => {
        setStreams(decodeURIComponent(props.location.hash.replace('#', '')))
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
                    height: '48px',
                    borderRadius: '9999px',
                    // background: lighten(theme.palette.primary.main, 0.3)
                    background: 'rgba(0,0,0,0)'
                }}
                onSubmit={(e) => {
                    e.preventDefault()
                    // submit logic (enter key) may be added here
                }}
            >
                <IconButton sx={{ p: '10px' }}>
                    <ExploreIcon sx={{ color: 'white' }} />
                </IconButton>
                <Autocomplete
                    sx={{ width: 1 }}
                    multiple
                    options={allStreams}
                    onChange={(a, value) => {
                        navigate(`/#${value.join(',')}`)
                    }}
                    renderInput={(params) => {
                        const { InputLabelProps, InputProps, ...rest } = params

                        return (
                            <InputBase
                                {...params.InputProps}
                                {...rest}
                                sx={{ color: 'white' }}
                                placeholder="streams"
                            />
                        )
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            // disabling ESLint here becase 'key' should exist in {..getTagProps({index})}
                            // eslint-disable-next-line
                            <Chip
                                label={option}
                                sx={{ color: 'white' }}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
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
