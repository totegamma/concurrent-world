import { Box, CssBaseline, Typography } from '@mui/material'
import { ConcrntLogo } from '../theming/ConcrntLogo'

export interface FullScreenLoadingProps {
    message: string
}

export const FullScreenLoading = (props: FullScreenLoadingProps): JSX.Element => {
    return (
        <CssBaseline>
            <Box
                sx={{
                    backgroundColor: '#0476d9',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100dvh',
                    width: '100dvw',
                    gap: 2
                }}
            >
                <ConcrntLogo size="100px" color="#fff" spinning={true} />
                <Typography variant="h5">{props.message}</Typography>
            </Box>
        </CssBaseline>
    )
}
