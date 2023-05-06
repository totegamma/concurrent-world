import {
    Button,
    Divider,
    Typography,
    TextField,
    Box,
    Modal,
    useTheme,
    IconButton,
    Paper
} from '@mui/material'
import { useContext, useState } from 'react'
import { ApplicationContext } from '../App'
import { Themes } from '../themes'
import { Keygen, LoadKey } from '../util'
import { ConcurrentLogo } from '../components/ConcurrentLogo'

export interface SettingsProp {
    setThemeName: (themename: string) => void
    setServerAddr: (serverAddr: string) => void
    setUserAddr: (userAddr: string) => void
    setPubKey: (key: string) => void
    setPrvKey: (key: string) => void
}

export function Settings(props: SettingsProp): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)

    const [draftPrivateKey, setDraftPrivateKey] = useState<string>('')

    const regenerateKeys = (): void => {
        const key = Keygen()
        props.setPubKey(key.publickey)
        props.setPrvKey(key.privatekey)
        props.setUserAddr(key.ccaddress)
    }

    const importKeys = (): void => {
        const key = LoadKey(draftPrivateKey)
        props.setPubKey(key.publickey)
        props.setPrvKey(key.privatekey)
        props.setUserAddr(key.ccaddress)
    }

    const [open, setOpen] = useState(false)

    return (
        <>
            <Modal
                open={open}
                onClose={() => {
                    setOpen(false)
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        transform: 'translate(-50%, -50%)',
                        flexDirection: 'column',
                        gap: '20px',
                        position: 'absolute',
                        padding: '20px',
                        borderRadius: '10px',
                        top: '50%',
                        left: '50%',
                        background: theme.palette.background.paper
                    }}
                >
                    <Typography
                        component="h2"
                        sx={{ color: theme.palette.text.primary }}
                    >
                        Are you sure?
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                        秘密鍵のバックアップがないと、アカウントを復元できません。
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            regenerateKeys()
                            setOpen(false)
                        }}
                    >
                        Generate New Key
                    </Button>
                </Box>
            </Modal>
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
                <Typography variant="h5" gutterBottom>
                    Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography sx={{ wordWrap: 'break-word' }}>
                    Your concurrent address: {appData.userAddress}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '15px',
                        gap: '5px'
                    }}
                >
                    <TextField
                        label="server"
                        variant="outlined"
                        value={appData.serverAddress}
                        onChange={(e) => {
                            props.setServerAddr(e.target.value)
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        <TextField
                            label="import private key"
                            variant="outlined"
                            value={draftPrivateKey}
                            sx={{ flexGrow: 1 }}
                            onChange={(e) => {
                                setDraftPrivateKey(e.target.value)
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                importKeys()
                            }}
                        >
                            Import
                        </Button>
                    </Box>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={(_) => {
                            setOpen(true)
                        }}
                    >
                        Generate New Key
                    </Button>
                </Box>

                <Typography variant="h5">Theme</Typography>
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'grid' },
                        flexFlow: 'column',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gridAutoRows: '1fr',
                        gap: '10px'
                    }}
                >
                    {Object.keys(Themes).map((e) => (
                        <Paper key={e}>
                            <Button
                                onClick={(_) => {
                                    props.setThemeName(e)
                                }}
                                style={{
                                    border: 'none',
                                    background: (Themes as any)[e].palette
                                        .background.paper,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    justifyContent: 'flex-start'
                                }}
                                color="info"
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        borderRadius: '100px',
                                        background:
                                            (Themes as any)[e].palette.primary
                                                ?.contrastText ?? '#fff'
                                    }}
                                >
                                    <ConcurrentLogo
                                        size="40px"
                                        upperColor={
                                            (Themes as any)[e].palette.primary
                                                .main
                                        }
                                        lowerColor={
                                            (Themes as any)[e].palette
                                                .background.default
                                        }
                                        frameColor={
                                            (Themes as any)[e].palette
                                                .background.default
                                        }
                                    />
                                </Box>
                                <Typography
                                    sx={{
                                        color:
                                            (Themes as any)[e].palette?.text
                                                ?.primary ?? '#000'
                                    }}
                                    variant="button"
                                >
                                    {e}
                                </Typography>
                            </Button>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </>
    )
}
