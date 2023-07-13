import { Box, IconButton, Typography, useTheme } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'

export interface IconWithNumberProps {
    icon: JSX.Element
    onClick: () => void
    state: boolean
    message: any
}
export const IconWithNumber = (props: IconWithNumberProps): JSX.Element => {
    const theme = useTheme()

    return (
        <Box sx={{ display: 'flex' }}>
            <IconButton
                sx={{
                    p: '0',
                    color: theme.palette.text.secondary
                }}
                color="primary"
                onClick={props.onClick}
            >
                {props.state ? <StarIcon /> : <StarOutlineIcon />}
            </IconButton>
            <Typography sx={{ size: '16px' }}>{props.message}</Typography>
        </Box>
    )
}
