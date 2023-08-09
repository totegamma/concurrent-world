import { Box, CssBaseline, Typography } from '@mui/material'
import { ConcurrentLogo } from '../theming/ConcurrentLogo'

export interface FullScreenLoadingProps {
    message: string
}

export const FullScreenLoading = (props: FullScreenLoadingProps): JSX.Element => {
    return (
        <CssBaseline>
            <Box
                sx={{
                    backgroundColor: '#211a3d',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100dvh',
                    width: '100dvw',
                    gap: 5
                }}
            >
                <ConcurrentLogo size="100px" upperColor="#fff" lowerColor="#fff" frameColor="#fff" spinning={true} />
                <Typography variant="h3">{props.message}</Typography>
            </Box>
        </CssBaseline>
    )
}
