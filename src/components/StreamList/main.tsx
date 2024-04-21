import { List, ListItem, ListItemText } from '@mui/material'
import { StreamListItem } from './StreamListItem'
import ListIcon from '@mui/icons-material/List'
import { useGlobalActions } from '../../context/GlobalActions'
import { useTranslation } from 'react-i18next'
import { useClient } from '../../context/ClientContext'
import { usePreference } from '../../context/PreferenceContext'
import { useNavigate } from 'react-router-dom'

export const StreamList = (): JSX.Element => {
    const { t } = useTranslation('', { keyPrefix: 'pages' })
    const { openMobileMenu } = useGlobalActions()
    const [lists] = usePreference('lists')
    const navigate = useNavigate()
    return (
        <List
            dense
            sx={{
                py: 0.5,
                width: '100%'
            }}
        >
            <ListItem
                onClick={() => {
                    navigate('/subscriptions')
                }}
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
                        openMobileMenu(false)
                    }}
                />
            ))}
        </List>
    )
}
