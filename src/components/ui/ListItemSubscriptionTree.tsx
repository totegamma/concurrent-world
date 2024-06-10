import { Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { type StreamList } from '../../model'
import { Link as RouterLink } from 'react-router-dom'

import ExpandMore from '@mui/icons-material/ExpandMore'
import { ListItemTimeline } from './ListItemTimeline'
import { usePreference } from '../../context/PreferenceContext'
import { type ListSubscriptionSchema, type CoreSubscription } from '@concurrent-world/client'
import { useGlobalState } from '../../context/GlobalState'

export interface ListItemSubscriptionTreeProps {
    id: string
    body: StreamList
    onClick?: () => void
}

export const ListItemSubscriptionTree = (props: ListItemSubscriptionTreeProps): JSX.Element => {
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

    const { allKnownSubscriptions } = useGlobalState()
    const subscription = allKnownSubscriptions.find((sub) => sub.id === props.id) as
        | CoreSubscription<ListSubscriptionSchema>
        | undefined

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
                    {subscription ? (
                        <ListItemText primary={subscription.document.body.name || 'No name'} />
                    ) : (
                        <ListItemText primary="❓ Not found" />
                    )}
                </ListItemButton>
            </ListItem>
            <Collapse in={open} timeout="auto">
                <List dense component="div" disablePadding>
                    {subscription?.items.map((sub) => (
                        <ListItemTimeline
                            key={sub.id}
                            timelineID={sub.id}
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
