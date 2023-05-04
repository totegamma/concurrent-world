import {
    Box,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

export interface ExplorerProps {
    watchList: string[]
    setWatchList: (newlist: string[]) => void
}

export function Explorer(props: ExplorerProps): JSX.Element {
    const theme = useTheme()

    const appData = useContext(ApplicationContext)
    const [streams, setStreams] = useState<string[]>([])

    useEffect(() => {
        fetch(appData.serverAddress + 'stream/list').then((data) => {
            data.json().then((json) => {
                setStreams(json)
            })
        })
    }, [])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                background: theme.palette.background.paper,
                minHeight: '100%'
            }}
        >
            <Typography variant="h5" gutterBottom>
                Explorer
            </Typography>
            <Divider />
            <Typography variant="h6" gutterBottom>
                streams
            </Typography>
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {streams.map((value) => {
                    const labelId = `checkbox-list-secondary-label-${value}`
                    return (
                        <ListItem key={value} disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (props.watchList.includes(value)) {
                                        props.setWatchList(
                                            props.watchList.filter(
                                                (e) => e !== value
                                            )
                                        )
                                    } else {
                                        props.setWatchList([
                                            ...props.watchList,
                                            value
                                        ])
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    {props.watchList.includes(value) ? (
                                        <StarIcon />
                                    ) : (
                                        <StarBorderIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    id={labelId}
                                    primary={`%${value}`}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )
}
