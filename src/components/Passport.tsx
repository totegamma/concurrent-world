import { Box, darken, useTheme } from '@mui/material'
import { type ConcurrentTheme } from '../model'
import { CCAvatar } from './CCAvatar'
import { ApplicationContext } from '../App'
import { useContext } from 'react'
import { useApi } from '../context/api'

export function Passport(): JSX.Element {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()

    const line1 = 'P<CCb72AAc9dcF088F7088b6718BE5a494fBB3861439'
    const line2 = 'HUB<CONCURRENT<SOCIAL<<<<<<<<<<<<<<<<<<<0xFF'

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                padding: '20px',
                color: theme.palette.background.contrastText,
                borderRadius: '5px',
                background: [
                    theme.palette.background.default,
                    `linear-gradient(${theme.palette.background.default}, ${darken(
                        theme.palette.background.default,
                        0.1
                    )})`
                ]
            }}
        >
            <Box>CONCURRENT</Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px'
                }}
            >
                <Box
                    sx={{
                        width: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <CCAvatar
                        identiconSource="hogehoge"
                        sx={{
                            width: '100px',
                            height: '100px'
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        flex: 1
                    }}
                >
                    <Box>
                        <Box>Current Name</Box>
                        <Box>{appData.profile?.payload.body.username}</Box>
                    </Box>
                    <Box>
                        <Box>Current Address</Box>
                        <Box>{api.host?.fqdn}</Box>
                    </Box>
                    <Box>
                        <Box>Registered</Box>
                        <Box>{appData.profile?.cdate}</Box>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                }}
            >
                <Box>{line1}</Box>
                <Box>{line2}</Box>
            </Box>
        </Box>
    )
}
