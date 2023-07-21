import { Collapse, List, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { Link as RouterLink } from 'react-router-dom'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { StreamLink } from './StreamLink'
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
            <ListItemButton dense component={RouterLink} to={`/#${props.id}`}>
                {open ? (
                    <ExpandLess
                        onClick={() => {
                            setOpen(!open)
                        }}
                    />
                ) : (
                    <ExpandMore
                        onClick={() => {
                            setOpen(!open)
                        }}
                    />
                )}
                <ListItemText primary={props.body.label} />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {props.body.items.map((stream) => (
                        <StreamLink
                            key={stream.id}
                            followable={stream}
                            sx={{
                                pl: 4
                            }}
                        />
                    ))}
                </List>
            </Collapse>
        </>
    )
}
