import { IconButton, List, ListItem, ListItemText } from '@mui/material'
import { StreamListItem } from './StreamListItem'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import { useGlobalActions } from '../../context/GlobalActions'
import { useTranslation } from 'react-i18next'
import { useClient } from '../../context/ClientContext'

export const StreamList = (): JSX.Element => {
    const { t } = useTranslation('', { keyPrefix: 'pages' })
    const { openMobileMenu, ownSubscriptions } = useGlobalActions()
    const { client } = useClient()
    return (
        <List
            dense
            sx={{
                py: 0.5,
                width: '100%'
            }}
        >
            <ListItem
                onClick={() => {}}
                secondaryAction={
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
                }
                sx={{
                    gap: '8px'
                }}
            >
                <ListIcon
                    sx={{
                        color: 'background.contrastText'
                    }}
                />
                <ListItemText primary={t('lists.title')} />
            </ListItem>
            {ownSubscriptions.map((sub) => (
                <StreamListItem
                    key={sub.id}
                    id={sub.id}
                    body={{
                        label: sub.id,
                        pinned: false,
                        expanded: true,
                        streams: [],
                        userStreams: [],
                        defaultPostStreams: []
                    }}
                    onClick={() => {
                        openMobileMenu(false)
                    }}
                />
            ))}
        </List>
    )
}
