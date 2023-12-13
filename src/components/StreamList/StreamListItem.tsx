import { Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { Link as RouterLink } from 'react-router-dom'

import ExpandMore from '@mui/icons-material/ExpandMore'
import { StreamLink, UserStreamLink } from './StreamLink'
import { usePreference } from '../../context/PreferenceContext'

export interface StreamListItemProps {
    id: string
    body: StreamList
    onClick?: () => void
}

export const StreamListItem = (props: StreamListItemProps): JSX.Element => {
    const [lists, updateLists] = usePreference('lists')

    const open = props.body.expanded
    const setOpen = (newOpen: boolean): void => {
        const old = lists
        old[props.id] = {
            ...props.body,
            expanded: newOpen
        }
        updateLists(old)
    }

    return (
        <>
            <ListItem
                dense
                sx={{
                    gap: 1
                }}
            >
                {open ? (
                    <ExpandMore
                        onClick={(): void => {
                            setOpen(false)
                        }}
                        sx={{
                            transform: 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }}
                    />
                ) : (
                    <ExpandMore
                        onClick={(): void => {
                            setOpen(true)
                        }}
                        sx={{
                            transform: 'rotate(-90deg)',
                            transition: 'transform 0.2s'
                        }}
                    />
                )}
                <ListItemButton
                    dense
                    sx={{
                        padding: 0
                    }}
                    component={RouterLink}
                    to={`/#${props.id}`}
                >
                    <ListItemText primary={props.body.label} />
                </ListItemButton>
            </ListItem>
            <Collapse in={open} timeout="auto">
                <List dense component="div" disablePadding>
                    {props.body.streams.map((stream) => (
                        <StreamLink
                            key={stream}
                            streamID={stream}
                            sx={{
                                pl: 2,
                                gap: 1
                            }}
                            onClick={props.onClick}
                        />
                    ))}
                    {props.body.userStreams.map((stream) => (
                        <UserStreamLink
                            key={stream.userID}
                            userHomeStream={stream}
                            sx={{
                                pl: 2,
                                gap: 1
                            }}
                            onClick={props.onClick}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    )
}
