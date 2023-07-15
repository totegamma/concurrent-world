import {
    Button,
    Divider,
    Typography,
    Box,
    Tabs,
    Tab,
    IconButton,
    FormGroup,
    FormControlLabel,
    Switch
} from '@mui/material'
import { LogoutButton } from '../components/Settings/LogoutButton'
import { ThemeSelect } from '../components/Settings/ThemeSelect'
import { ImgurSettings } from '../components/Settings/Imgur'
import { useApi } from '../context/api'
import { useSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { APSettings } from '../components/APSettings'
import { Passport } from '../components/Passport'
import Tilt from 'react-parallax-tilt'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { ProfileEditor } from '../components/ProfileEditor'
import { ApplicationContext } from '../App'
import { usePreference } from '../context/PreferenceContext'

export interface SettingsProp {
    setThemeName: (themeName: string) => void
}

export function Settings(props: SettingsProp): JSX.Element {
    const client = useApi()
    const pref = usePreference()
    const appData = useContext(ApplicationContext)
    const { enqueueSnackbar } = useSnackbar()

    const deleteAllCache = (): void => {
        if (window.caches) {
            caches.keys().then((names) => {
                // Delete all the cache files
                names.forEach((name) => {
                    caches.delete(name)
                })
            })
            enqueueSnackbar('Cache deleted', { variant: 'success' })
        } else {
            enqueueSnackbar('No cache to delete', { variant: 'info' })
        }
    }

    const [tab, setTab] = useState(0)
    const [showPrivateKey, setShowPrivateKey] = useState(false)

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                padding: '20px',
                background: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Settings
            </Typography>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, index) => {
                    setTab(index)
                }}
            >
                <Tab label="基本設定" />
                <Tab label="アカウント詳細" />
                <Tab label="Activitypub" />
            </Tabs>
            {tab === 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px'
                    }}
                >
                    <Box>
                        <Typography variant="h3">プロフィール</Typography>
                        <Box
                            sx={{
                                width: '100%',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        >
                            <ProfileEditor
                                id={appData.user?.profile.id}
                                initial={appData.user?.profile}
                                onSubmit={(_profile) => {
                                    enqueueSnackbar('更新しました', { variant: 'success' })
                                }}
                            />
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="h3">基本</Typography>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={pref.showEditorOnTop}
                                        onChange={(e) => {
                                            pref.setShowEditorOnTop(e.target.checked)
                                        }}
                                    />
                                }
                                label="投稿エディタを上部に表示"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={pref.showEditorOnTopMobile}
                                        onChange={(e) => {
                                            pref.setShowEditorOnTopMobile(e.target.checked)
                                        }}
                                    />
                                }
                                label="投稿エディタを上部に表示 (モバイル)"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={pref.devMode}
                                        onChange={(e) => {
                                            pref.setDevMode(e.target.checked)
                                        }}
                                    />
                                }
                                label="開発者モード"
                            />
                        </FormGroup>
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
                        <Typography variant="h3">便利ボタン</Typography>
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                deleteAllCache()
                            }}
                        >
                            Clear Cache
                        </Button>
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                window.location.reload()
                            }}
                        >
                            Force Reload
                        </Button>
                    </Box>

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
            )}
            {tab === 1 && (
                <>
                    <Box
                        sx={{
                            padding: { xs: '10px', sm: '10px 50px' }
                        }}
                    >
                        <Tilt glareEnable={true} glareBorderRadius="5%">
                            <Passport />
                        </Tilt>
                    </Box>
                    <Divider />
                    <Typography variant="h3" gutterBottom>
                        CCID
                    </Typography>
                    <Typography>{client.ccid}</Typography>

                    <Typography variant="h3" gutterBottom>
                        Host
                    </Typography>
                    <Typography>{client.api.host}</Typography>

                    <Typography variant="h3" gutterBottom>
                        Privatekey
                    </Typography>
                    <Typography
                        sx={{
                            wordBreak: 'break-all',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPrivateKey ? client.api.privatekey : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                        <IconButton
                            sx={{ ml: 'auto' }}
                            onClick={() => {
                                setShowPrivateKey(!showPrivateKey)
                            }}
                        >
                            {!showPrivateKey ? (
                                <VisibilityIcon sx={{ color: 'text.primary' }} />
                            ) : (
                                <VisibilityOffIcon sx={{ color: 'text.primary' }} />
                            )}
                        </IconButton>
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={(_) => {
                            if (client.api.host === undefined) {
                                return
                            }
                            const jwt = client.api.constructJWT({
                                exp: Math.floor((new Date().getTime() + 60 * 60 * 1000) / 1000).toString()
                            }) // 1h validity
                            window.location.href = `https://${client.api.host}/login?token=${jwt}`
                        }}
                    >
                        Goto Domain Home
                    </Button>
                </>
            )}
            {tab === 2 && <APSettings />}
        </Box>
    )
}
