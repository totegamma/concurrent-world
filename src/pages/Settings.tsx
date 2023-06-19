import { Button, Divider, Typography, Box, useTheme } from '@mui/material'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { ThemeSelect } from '../components/Settings/ThemeSelect'
import { ImgurSettings } from '../components/Settings/Imgur'
import { useApi } from '../context/api'

export interface SettingsProp {
    setThemeName: (themeName: string) => void
}

export function Settings(props: SettingsProp): JSX.Element {
    const api = useApi()
    const theme = useTheme()

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
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                window.location.reload()
                            }}
                        >
                            Force Reload
                        </Button>
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                if (api.host === undefined) {
                                    return
                                }
                                const jwt = api.constructJWT({
                                    exp: Math.floor((new Date().getTime() + 60 * 60 * 1000) / 1000).toString()
                                }) // 1h validity
                                window.location.href = `https://${api.host.fqdn}/login?jwt=${jwt}`
                            }}
                        >
                            Goto Domain Home
                        </Button>
                    </Box>

                    <ThemeSelect setThemeName={props.setThemeName} />
                    <ImgurSettings />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}
                    >
                        <Typography variant="h3" color="error" gutterBottom>
                            Danger Zone
                        </Typography>
                        <LogoutButton />
                    </Box>
                </Box>
            </Box>
        </>
    )
}
