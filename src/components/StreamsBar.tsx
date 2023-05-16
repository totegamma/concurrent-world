import { useContext, useEffect, useState } from 'react'
import {
    Paper,
    IconButton,
    InputBase,
    Box,
    useTheme,
    Autocomplete,
    Chip,
    Modal
} from '@mui/material'
import ExploreIcon from '@mui/icons-material/Explore'
import SearchIcon from '@mui/icons-material/Search'
import {
    Link,
    useNavigate,
    type Location as ReactLocation
} from 'react-router-dom'
import { ApplicationContext } from '../App'
import { type Stream } from '../model'
import { NavigatorSettings } from './NavigatorSettings'

export interface StreamsBarProps {
    location: ReactLocation
}

export function StreamsBar(props: StreamsBarProps): JSX.Element {
    const theme = useTheme()
    const navigate = useNavigate()

    const [allStreams, setAllStreams] = useState<Stream[]>([])
    const [selectedStreams, setSelectedStreams] = useState<string[]>(
        decodeURIComponent(props.location.hash.replace('#', '')).split(',')
    )
    const [streamMapper, setStreamMapper] = useState<Record<string, string>>({})
    const appData = useContext(ApplicationContext)

    const [settingsOpen, setSettignsOpen] = useState<boolean>(true)

    useEffect(() => {
        fetch(
            appData.serverAddress +
                'stream/list?schema=net.gammalab.concurrent.tbdStreamMeta'
        ).then((data) => {
            data.json().then((streams: Stream[]) => {
                setAllStreams(streams)
                setStreamMapper(
                    Object.fromEntries(
                        streams.map((stream) => [
                            JSON.parse(stream.meta).name,
                            stream.id
                        ])
                    )
                )
            })
        })
    }, [])

    // force local streams to change in case of external input (i.e. sidebar button)
    useEffect(() => {
        ;(async () => {
            setSelectedStreams(
                (
                    await Promise.all(
                        props.location.hash
                            .replace('#', '')
                            .split(',')
                            .map(
                                async (id) =>
                                    await appData.streamDict
                                        .get(id)
                                        .then((e) =>
                                            e.meta
                                                ? JSON.parse(e.meta).name
                                                : null
                                        )
                            )
                    )
                ).filter((e) => e) as string[]
            )
        })()
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
                <IconButton
                    sx={{ p: '10px' }}
                    onClick={() => {
                        setSettignsOpen(true)
                    }}
                >
                    <ExploreIcon sx={{ color: 'primary.contrastText' }} />
                </IconButton>
                <Autocomplete
                    sx={{ width: 1 }}
                    multiple
                    value={selectedStreams[0] !== '' ? selectedStreams : []}
                    options={allStreams.map(
                        (stream) => JSON.parse(stream.meta).name
                    )}
                    onChange={(_, value) => {
                        navigate(
                            `/#${value.map((id) => streamMapper[id]).join(',')}`
                        )
                    }}
                    renderInput={(params) => {
                        const { InputLabelProps, InputProps, ...rest } = params

                        return (
                            <InputBase
                                {...params.InputProps}
                                {...rest}
                                sx={{ color: 'primary.contrastText' }}
                                placeholder={
                                    props.location.hash ? '' : 'following'
                                }
                            />
                        )
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            // disabling ESLint here becase 'key' should exist in {..getTagProps({index})}
                            // eslint-disable-next-line
                            <Chip
                                label={option}
                                sx={{ color: 'primary.contrastText' }}
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                />
                <IconButton
                    sx={{ p: '10px' }}
                    component={Link}
                    to={`/#${selectedStreams.join(',')}`}
                >
                    <SearchIcon sx={{ color: 'primary.contrastText' }} />
                </IconButton>
            </Paper>
            <Modal
                open={settingsOpen}
                onClose={() => {
                    setSettignsOpen(false)
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Paper
                    sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        p: '20px'
                    }}
                >
                    <NavigatorSettings />
                </Paper>
            </Modal>
        </Box>
    )
}
