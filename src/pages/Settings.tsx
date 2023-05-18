import {
    Button,
    Divider,
    Typography,
    TextField,
    Box,
    useTheme
} from '@mui/material'
import { useContext } from 'react'
import { ApplicationContext } from '../App'
import { LogoutButton } from '../components/LogoutButton'
import { ThemeSelect } from '../components/ThemeSelect'

export interface SettingsProp {
    setThemeName: (themeName: string) => void
    setServerAddr: (serverAddr: string) => void
    setUserAddr: (userAddr: string) => void
    setPubKey: (key: string) => void
    setPrvKey: (key: string) => void
}

export function Settings(props: SettingsProp): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    padding: '20px',
                    background: theme.palette.background.paper,
                    minHeight: '100%',
                    overflowY: 'scroll'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}
                    >
                        <Typography variant="h3">Basic</Typography>
                        <TextField
                            label="server"
                            variant="outlined"
                            value={appData.serverAddress}
                            onChange={(e) => {
                                props.setServerAddr(e.target.value)
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                window.location.reload()
                            }}
                        >
                            Force Reload
                        </Button>
                    </Box>

                    <ThemeSelect setThemeName={props.setThemeName} />

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}
                    >
                        <Typography variant="h3">DangerZone</Typography>
                        <LogoutButton />
                    </Box>
                </Box>
            </Box>
        </>
    )
}
