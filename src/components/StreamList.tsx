import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material'
import { Link } from 'react-router-dom'
import PercentIcon from '@mui/icons-material/Percent'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import { type Stream } from '../model'

interface Props {
    streams: string[]
}

export function StreamList(props: Props): JSX.Element {
    const appData = useContext(ApplicationContext)
    const [watchStreams, setWatchStreams] = useState<Stream[]>([])

    useEffect(() => {
        ;(async () => {
            setWatchStreams(
                (
                    await Promise.all(
                        props.streams.map(
                            async (id) => await appData.streamDict?.get(id)
                        )
                    )
                ).filter((e) => e) as Stream[]
            )
        })()
    }, [props.streams])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                overflowY: 'auto',
                overflowX: 'hidden'
            }}
        >
            <List
                dense
                sx={{
                    width: '100%',
                    maxWidth: 360,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {watchStreams.map((stream) => {
                    const labelId = `checkbox-list-secondary-label-${stream.id}`
                    return (
                        <ListItem key={stream.id} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={`/#${stream.id}`}
                                sx={{ gap: 1 }}
                            >
                                <PercentIcon
                                    sx={{
                                        color: 'background.contrastText'
                                    }}
                                />
                                <ListItemText
                                    id={labelId}
                                    primary={
                                        stream.meta
                                            ? JSON.parse(stream.meta).name
                                            : 'backrooms'
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )
}
