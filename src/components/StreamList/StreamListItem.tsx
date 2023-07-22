import { Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { Link as RouterLink } from 'react-router-dom'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { StreamLink, UserStreamLink } from './StreamLink'
import { usePreference } from '../../context/PreferenceContext'

export interface StreamListItemProps {
    id: string
    body: StreamList
}

export const StreamListItem = (props: StreamListItemProps): JSX.Element => {
    const pref = usePreference()

    const open = props.body.expanded
    const setOpen = (newOpen: boolean): void => {
        pref.updateList(props.id, {
            ...props.body,
            expanded: newOpen
        })
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
                    <ExpandLess
                        onClick={(): void => {
                            setOpen(false)
                        }}
                    />
                ) : (
                    <ExpandMore
                        onClick={(): void => {
                            setOpen(true)
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
                        />
                    ))}
                </List>
            </Collapse>
        </>
    )
}
