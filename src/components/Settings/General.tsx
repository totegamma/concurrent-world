import { Box, Button, Divider, FormControlLabel, FormGroup, Slider, Switch, TextField, Typography } from '@mui/material'
import { forwardRef, useContext, useState } from 'react'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { usePreference } from '../../context/PreferenceContext'
import { useSnackbar } from 'notistack'
import { LogoutButton } from './LogoutButton'
import { ThemeSelect } from './ThemeSelect'
import { ImgurSettings } from './Imgur'
import { IssueJWT } from '@concurrent-world/client'
import { ApplicationContext } from '../../App'

export const GeneralSettings = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const appData = useContext(ApplicationContext)
    const client = useApi()
    const pref = usePreference()
    const { enqueueSnackbar } = useSnackbar()
    const [invitationCode, setInvitationCode] = useState<string>('')

    const tags = client?.api?.getTokenClaims()?.tag?.split(',') ?? []

    const [emojiPackages, setEmojiPackages] = useState<string>(pref.emojiPackages.join(','))

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
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="h3">サウンド</Typography>
                    <Typography variant="h4">音量</Typography>
                    <Slider
                        aria-label="Volume"
                        value={appData.volume}
                        onChange={(_, value) => {
                            appData.setVolume(value as number)
                        }}
                    />
                    <Typography variant="h4">Override</Typography>
                    <TextField
                        label="投稿音"
                        placeholder="https://example.com/sound.mp3"
                        value={appData.postSound}
                        onChange={(e) => {
                            appData.setPostSound(e.target.value)
                        }}
                    />
                    <TextField
                        label="通知音"
                        placeholder="https://example.com/sound.mp3"
                        value={appData.notificationSound}
                        onChange={(e) => {
                            appData.setNotificationSound(e.target.value)
                        }}
                    />
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="h3">絵文字パッケージ</Typography>
                    <TextField
                        label="絵文字パッケージ"
                        placeholder="https://example.com/emoji.zip"
                        value={emojiPackages}
                        onChange={(e) => {
                            setEmojiPackages(e.target.value)
                        }}
                        onBlur={() => {
                            pref.setEmojiPackages(emojiPackages.split(','))
                        }}
                    />
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
                                            exp: Math.floor(
                                                (new Date().getTime() + 24 * 60 * 60 * 1000) / 1000
                                            ).toString()
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
