import { Box, Button, Divider, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { usePreference } from '../../context/PreferenceContext'
import { useSnackbar } from 'notistack'
import { LogoutButton } from './LogoutButton'
import { ThemeSelect } from './ThemeSelect'
import { ImgurSettings } from './Imgur'
import { IssueJWT } from '@concurrent-world/client'

export const GeneralSettings = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const { enqueueSnackbar } = useSnackbar()
    const [invitationCode, setInvitationCode] = useState<string>('')

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

    return (
        <div ref={ref} {...props}>
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
                            id={client?.user?.profile?.id}
                            initial={client?.user?.profile}
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
                <ThemeSelect />
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
                    <Divider sx={{ my: 2 }} />
                    {invitationCode === '' ? (
                        <Button
                            variant="contained"
                            onClick={(_) => {
                                if (client.api.host === undefined) {
                                    return
                                }
                                const jwt = IssueJWT(client.keyPair.privatekey, {
                                    iss: client.ccid,
                                    aud: client.domain,
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
                            <Typography variant="body2">
                                このコードを他のユーザーに渡すことで、このドメインに登録できます。
                                <br />
                                但し、あなたが招待権を持っているとは限りません。
                                <br />
                                詳しくはドメイン管理者にお問い合わせください。
                            </Typography>
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
        </div>
    )
})

GeneralSettings.displayName = 'GeneralSettings'
