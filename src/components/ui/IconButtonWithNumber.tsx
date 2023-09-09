import { Box, IconButton, Typography, useTheme } from '@mui/material'

export interface IconButtonWithNumberProps {
    icon: JSX.Element
    onClick: (e: any) => void
    message: number
}
export const IconButtonWithNumber = (props: IconButtonWithNumberProps): JSX.Element => {
    const theme = useTheme()

    return (
        <Box
            sx={{
                display: 'flex',
                width: '3rem'
            }}
        >
            <IconButton
                sx={{
                    p: '0',
                    color: theme.palette.text.secondary
                }}
                color="primary"
                onClick={props.onClick}
            >
                {props.icon}
            </IconButton>
            <Typography sx={{ fontSize: 13, lineHeight: 2 }}>{props.message > 0 ? props.message : <></>}</Typography>
        </Box>
    )
}
