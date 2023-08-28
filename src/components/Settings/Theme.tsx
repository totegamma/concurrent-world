import { Box } from '@mui/material'
import { ThemeSelect } from './ThemeSelect'

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
        </Box>
    )
}
