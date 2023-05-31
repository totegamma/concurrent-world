import {
    Button,
    Divider,
    Typography,
    Box,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { ThemeSelect } from '../components/Settings/ThemeSelect'
import { ImgurSettings } from '../components/Settings/Imgur'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useApi } from '../context/api'
import { useState } from 'react'

export interface SettingsProp {
    setThemeName: (themeName: string) => void
}

export function Settings(props: SettingsProp): JSX.Element {
    const api = useApi()
    const theme = useTheme()

    const [homeReseted, setHomeReseted] = useState<boolean>(false)

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
                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography color="error">DangerZone</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', gap: '15px' }}>
                                {homeReseted ? (
                                    <Typography>Done!</Typography>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => {
                                            api.setupUserstreams()
                                            setHomeReseted(true)
                                        }}
                                    >
                                        Reset UserStreams
                                    </Button>
                                )}
                                <LogoutButton />
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </Box>
            </Box>
        </>
    )
}
