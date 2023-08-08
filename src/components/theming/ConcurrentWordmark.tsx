import { Box, Typography } from '@mui/material'
import { ConcurrentLogo } from './ConcurrentLogo'

export interface ConcurrentWordmarkProps {
    color: string
}

export function ConcurrentWordmark(props: ConcurrentWordmarkProps): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center'
            }}
        >
            <Box>
                <ConcurrentLogo
                    size="32px"
                    upperColor={props.color}
                    lowerColor={props.color}
                    frameColor={props.color}
                />
            </Box>
            <Typography
                sx={{
                    color: props.color,
                    fontWeight: 600,
                    fontSize: '22px'
                }}
            >
                Concurrent
            </Typography>
        </Box>
    )
}
