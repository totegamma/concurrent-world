import { Box, Button, Divider, FormControlLabel, FormGroup, IconButton, Switch, Typography } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import { Passport } from '../../components/theming/Passport'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Tilt from 'react-parallax-tilt'
import { useApi } from '../../context/api'
import { useState } from 'react'
import { useSnackbar } from 'notistack'
import { IssueJWT } from '@concurrent-world/client'

export const GeneralSettings = (): JSX.Element => {
    const pref = usePreference()
    const client = useApi()
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [invitationCode, setInvitationCode] = useState<string>('')

    const tags = client?.api?.getTokenClaims()?.tag?.split(',') ?? []
    const { enqueueSnackbar } = useSnackbar()

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
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
            {tags.includes('_invite') && (
                <>
                    {invitationCode === '' ? (
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                if (client.api.host === undefined) {
                                    return
                                }
                                const jwt = IssueJWT(client.keyPair.privatekey, {
                                    iss: client.ccid,
                                    aud: client.host,
                                    sub: 'CONCURRENT_INVITE',
                                    exp: Math.floor((new Date().getTime() + 24 * 60 * 60 * 1000) / 1000).toString()
                                }) // 24h validity
                                setInvitationCode(jwt)
                            }}
                        >
                            招待コードを生成
                        </Button>
                    ) : (
                        <>
                            <Typography variant="body1">招待コード(24時間有効)</Typography>
                            <pre
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    backgroundColor: '#333',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    color: '#fff'
                                }}
                            >
                                {invitationCode}
                            </pre>
                            <Button
                                variant="contained"
                                onClick={(_) => {
                                    navigator.clipboard.writeText(invitationCode)
                                    enqueueSnackbar('コピーしました', { variant: 'success' })
                                }}
                            >
                                招待コードをコピー
                            </Button>
                        </>
                    )}
                </>
            )}
        </Box>
    )
}
