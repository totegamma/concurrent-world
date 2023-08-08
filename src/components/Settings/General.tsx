import { Box, Button, FormControlLabel, FormGroup, Switch, Typography } from '@mui/material'
import { forwardRef } from 'react'
import { ProfileEditor } from '../ProfileEditor'
import { useApi } from '../../context/api'
import { usePreference } from '../../context/PreferenceContext'
import { useSnackbar } from 'notistack'
import { LogoutButton } from './LogoutButton'
import { ThemeSelect } from './ThemeSelect'
import { ImgurSettings } from './Imgur'

export const GeneralSettings = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
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
