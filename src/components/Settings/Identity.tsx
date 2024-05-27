import {
    Alert,
    AlertTitle,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Switch,
    FormGroup,
    FormControlLabel,
    Typography,
    TextField,
    Button
} from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { Passport } from '../theming/Passport'
import { Suspense, lazy, useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { type Key } from '@concurrent-world/client/dist/types/model/core'
import { usePreference } from '../../context/PreferenceContext'
import { useTranslation } from 'react-i18next'
import { Codeblock } from '../ui/Codeblock'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { KeyCard } from '../ui/KeyCard'
import { type Identity } from '@concurrent-world/client'
import { enqueueSnackbar } from 'notistack'

const SwitchMasterToSub = lazy(() => import('../SwitchMasterToSub'))

export const IdentitySettings = (): JSX.Element => {
    const { client } = useClient()
    const identity: Identity = JSON.parse(localStorage.getItem('Identity') || 'null')
    const subkey = JSON.parse(localStorage.getItem('SubKey') || 'null')

    const [keys, setKeys] = useState<Key[]>([])
    const [target, setTarget] = useState<string | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [hideDisabledSubKey, setHideDisabledSubKey] = usePreference('hideDisabledSubKey')
    const [aliasDraft, setAliasDraft] = useState<string>('')

    const { t } = useTranslation('', { keyPrefix: 'settings.identity' })

    useEffect(() => {
        client.api.getKeyList().then((res) => {
            setKeys(res)
        })
    }, [])

    const toggleHideDisabledSubKey = (): void => {
        setHideDisabledSubKey(!hideDisabledSubKey)
    }

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

            {client.user?.alias ? (
                <>
                    <Alert severity="info">
                        <Typography variant="body1">
                            アカウントにはエイリアス{client.user.alias}が設定されています。
                        </Typography>
                    </Alert>
                </>
            ) : (
                <>
                    <Alert severity="info">
                        <AlertTitle>アカウントエイリアス未設定</AlertTitle>
                        <Typography gutterBottom>
                            ドメインをお持ちの場合、以下のtxtレコードを作成することで自身のアカウントにエイリアスを設定できます。
                        </Typography>

                        <TextField
                            label="設定したいドメイン"
                            value={aliasDraft}
                            onChange={(e) => {
                                setAliasDraft(e.target.value)
                            }}
                        />

                        <Codeblock language="js">{`対象ドメイン: _concrnt.${aliasDraft}
レコード値:
"ccid=${client.ccid}"
"hint=${client.host}"`}</Codeblock>

                        <Button
                            onClick={() => {
                                fetch(`https://${client.host}/api/v1/entity/${aliasDraft}`)
                                    .then(async (res) => {
                                        const resjson = await res.json()
                                        console.log(resjson)
                                        if (resjson.content.alias) {
                                            enqueueSnackbar('検証成功', { variant: 'success' })
                                        } else {
                                            enqueueSnackbar('検証に失敗しました。', { variant: 'error' })
                                        }
                                    })
                                    .catch((e) => {
                                        console.error(e)
                                        enqueueSnackbar('検証に失敗しました。', { variant: 'error' })
                                    })
                            }}
                        >
                            設定を検証
                        </Button>
                    </Alert>
                </>
            )}

            {identity && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Alert severity="warning">{t('loginType.masterKey')}</Alert>

                    <Suspense fallback={<>loading...</>}>
                        <SwitchMasterToSub identity={identity} />
                    </Suspense>
                </Box>
            )}

            {subkey && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Alert severity="info">{t('loginType.subKey')}</Alert>
                </Box>
            )}

            {!subkey && !identity && <Alert severity="error">{t('loginType.secret')}</Alert>}

            <Box
                sx={{
                    padding: { sm: '10px 10px' }
                }}
            >
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch size="small" checked={hideDisabledSubKey} onChange={toggleHideDisabledSubKey} />
                        }
                        label={t('hideSubKey')}
                    />
                </FormGroup>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}
            >
                {keys
                    .filter((key) => key.revokeDocument === 'null' || !hideDisabledSubKey)
                    .map((key) => (
                        <KeyCard
                            key={key.id}
                            item={key}
                            endItem={
                                <IconButton
                                    sx={{
                                        width: '40px',
                                        height: '40px'
                                    }}
                                    onClick={(event) => {
                                        setTarget(key.id)
                                        setAnchorEl(event.currentTarget)
                                    }}
                                >
                                    <MoreHorizIcon />
                                </IconButton>
                            }
                        />
                    ))}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => {
                        setAnchorEl(null)
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            if (target === null) {
                                return
                            }
                            client.api.revokeSubkey(target).then(() => {
                                client.api.getKeyList().then((res) => {
                                    setKeys(res)
                                })
                            })
                        }}
                    >
                        {t('deactivate')}
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    )
}
