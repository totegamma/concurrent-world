import { Avatar, Box } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'

import { Link as RouterLink } from 'react-router-dom'

export const MinimalStreamList = (): JSX.Element => {
    const [lists] = usePreference('lists')
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
                    {lists[key].label}
                </Avatar>
            ))}
        </Box>
    )
}
