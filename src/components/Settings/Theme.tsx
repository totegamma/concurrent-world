import { Box } from '@mui/material'
import { ThemeSelect } from './ThemeSelect'
import { ThemeCreator } from '../ThemeCreator'

export const ThemeSettings = (): JSX.Element => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}
        >
            <ThemeSelect />
            <ThemeCreator />
        </Box>
    )
}
