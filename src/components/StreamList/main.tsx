import { IconButton, List, ListItem, ListItemText } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import { v4 as uuidv4 } from 'uuid'
import { StreamListItem } from './StreamListItem'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import { useGlobalActions } from '../../context/GlobalActions'
import { useTranslation } from 'react-i18next'

export const StreamList = (): JSX.Element => {
    const { t } = useTranslation('', { keyPrefix: 'pages' })
    const [lists, setLists] = usePreference('lists')
    const actions = useGlobalActions()
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
                            const old = lists
                            old[uuidv4()] = {
                                label: 'new list',
                                pinned: false,
                                expanded: false,
                                streams: [],
                                userStreams: [],
                                defaultPostStreams: []
                            }
                            setLists(old)
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
            {Object.keys(lists).map((key) => (
                <StreamListItem
                    key={key}
                    id={key}
                    body={lists[key]}
                    onClick={() => {
                        actions.openMobileMenu(false)
                    }}
                />
            ))}
        </List>
    )
}
