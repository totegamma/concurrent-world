import {
    Button,
    Divider,
    Typography,
    TextField,
    Box,
    Modal,
    useTheme,
    Paper
} from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { ApplicationContext } from '../App'
import { Themes, createConcurrentTheme } from '../themes'
import { Keygen, LoadKey } from '../util'
import { ConcurrentLogo } from '../components/ConcurrentLogo'
import type { ConcurrentTheme } from '../model'

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

    const previewTheme: Record<string, ConcurrentTheme> = useMemo(
        () =>
            Object.fromEntries(
                Object.keys(Themes).map((e) => [e, createConcurrentTheme(e)])
            ),
        []
    )

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
                <Typography variant="h2" gutterBottom>
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

                <Typography variant="h3">Theme</Typography>
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'grid' },
                        flexFlow: 'column',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gridAutoRows: '1fr',
                        gap: '10px'
                    }}
                >
                    {Object.keys(previewTheme).map((e) => (
                        <Paper key={e}>
                            <Button
                                onClick={(_) => {
                                    props.setThemeName(e)
                                }}
                                style={{
                                    border: 'none',
                                    background:
                                        previewTheme[e].palette.background
                                            .paper,
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
                                            previewTheme[e].palette.primary
                                                .contrastText
                                    }}
                                >
                                    <ConcurrentLogo
                                        size="40px"
                                        upperColor={
                                            previewTheme[e].palette.primary.main
                                        }
                                        lowerColor={
                                            previewTheme[e].palette.background
                                                .default
                                        }
                                        frameColor={
                                            previewTheme[e].palette.background
                                                .default
                                        }
                                    />
                                </Box>
                                <Typography
                                    sx={{
                                        color: previewTheme[e].palette.text
                                            .primary
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
