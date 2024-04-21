import { Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { Link as RouterLink } from 'react-router-dom'

import ExpandMore from '@mui/icons-material/ExpandMore'
import { StreamLink, UserStreamLink } from './StreamLink'
import { usePreference } from '../../context/PreferenceContext'
import { useClient } from '../../context/ClientContext'
import { useEffect, useState } from 'react'
import { type CoreSubscription } from '@concurrent-world/client'

export interface StreamListItemProps {
    id: string
    body: StreamList
    onClick?: () => void
}

export const StreamListItem = (props: StreamListItemProps): JSX.Element => {
    const { client } = useClient()
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

    const [subscription, setSubscription] = useState<CoreSubscription<any> | null>(null)

    useEffect(() => {
        if (!client) return
        if (subscription) return
        client.api
            .getSubscription(props.id)
            .then((sub) => {
                console.log(sub)
                if (sub) setSubscription(sub)
            })
            .catch((e) => {
                console.error(e)
            })
    }, [])

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
                    <ListItemText primary={props.id} />
                </ListItemButton>
            </ListItem>
            <Collapse in={open} timeout="auto">
                <List dense component="div" disablePadding>
                    {subscription?.items.map((sub) => (
                        <StreamLink
                            key={sub.id}
                            streamID={sub.id}
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
