import { Box, Divider, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useClient } from '../context/ClientContext'
import { useTranslation } from 'react-i18next'
import { usePreference } from '../context/PreferenceContext'

import AddIcon from '@mui/icons-material/Add'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { useEffect, useState } from 'react'
import { type CoreSubscription } from '@concurrent-world/client'

export function ManageSubsPage(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.contacts' })
    const { client } = useClient()
    const [lists, setLists] = usePreference('lists')
    const listedSubs = Object.keys(lists)

    const [ownSubscriptions, setOwnSubscriptions] = useState<Array<CoreSubscription<any>>>([])
    const unlistedSubs = ownSubscriptions.filter((sub) => !listedSubs.includes(sub.id))

    useEffect(() => {
        client.api.getOwnSubscriptions().then((subs) => {
            setOwnSubscriptions(subs)
        })
    }, [])

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    padding: '20px 20px 0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    ManageSubscriptions
                </Typography>
                <Divider />
                <IconButton
                    sx={{
                        p: 0,
                        color: 'background.contrastText'
                    }}
                    onClick={() => {
                        client.api
                            .upsertSubscription(
                                'https://schema.concrnt.world/s/common.json',
                                {},
                                { indexable: false, domainOwned: false }
                            )
                            .then((subscription) => {
                                console.log(subscription)
                            })
                            .catch((error) => {
                                console.error(error)
                            })
                    }}
                >
                    <AddIcon />
                </IconButton>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: '20px',
                        marginTop: '20px'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1'
                        }}
                    >
                        <Typography variant="h3" gutterBottom>
                            Unlisted Subscriptions
                        </Typography>
                        <List>
                            {unlistedSubs.map((sub) => (
                                <ListItem
                                    key={sub.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => {
                                                const old = lists
                                                old[sub.id] = {
                                                    pinned: false,
                                                    expanded: false,
                                                    defaultPostStreams: ['all']
                                                }
                                                setLists(old)
                                            }}
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={sub.id} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1'
                        }}
                    >
                        <Typography variant="h3" gutterBottom>
                            Listed Subscriptions
                        </Typography>
                        <List>
                            {listedSubs.map((subId) => (
                                <ListItem
                                    key={subId}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => {
                                                const old = lists
                                                delete old[subId]
                                                setLists(old)
                                            }}
                                        >
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText primary={subId} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
