import { Collapse, List, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { StreamLink } from './StreamLink'

export interface StreamListItemProps {
    id: string
    body: StreamList
}

export const StreamListItem = (props: StreamListItemProps): JSX.Element => {
    const [open, setOpen] = useState<boolean>(false)

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
                    {props.body.streams.map((stream) => (
                        <StreamLink
                            key={stream}
                            id={stream}
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
