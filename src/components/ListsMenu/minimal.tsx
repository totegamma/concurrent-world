import { Avatar, Box } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'

import { Link as RouterLink } from 'react-router-dom'
import { useGlobalActions } from '../../context/GlobalActions'

export const MinimalListsMenu = (): JSX.Element => {
    const [lists] = usePreference('lists')
    const action = useGlobalActions()

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexFlow: 'column',
                alignItems: 'center',
                gap: 1,
                p: 1
            }}
        >
            {Object.keys(lists).map((key) => (
                <Avatar
                    key={key}
                    component={RouterLink}
                    to={`/#${key}`}
                    sx={{
                        textDecoration: 'none'
                    }}
                >
                    {action.listedSubscriptions[key].document.body.name[0] || '📝'}
                </Avatar>
            ))}
        </Box>
    )
}
