import { Box, Typography } from '@mui/material'
import { ConcurrentLogo } from '../theming/ConcurrentLogo'

export interface LoadingProps {
    message: string
    color: string
}

export const Loading = (props: LoadingProps): JSX.Element => {
    return (
        <Box
            sx={{
                color: props.color,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
            }}
        >
            <ConcurrentLogo
                size="30px"
                upperColor={props.color}
                lowerColor={props.color}
                frameColor={props.color}
                spinning={true}
            />
            <Typography variant="body1">{props.message}</Typography>
        </Box>
    )
}
