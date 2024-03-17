import { Alert, Box, IconButton, Menu, MenuItem, Switch, FormGroup, FormControlLabel } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { Passport } from '../theming/Passport'
import { Suspense, lazy, useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { type Key } from '@concurrent-world/client/dist/types/model/core'
import { usePreference } from '../../context/PreferenceContext'
import { useTranslation } from 'react-i18next'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { KeyCard } from '../ui/KeyCard'

const SwitchMasterToSub = lazy(() => import('../SwitchMasterToSub'))

export const IdentitySettings = (): JSX.Element => {
    const { client } = useClient()
    const mnemonic = JSON.parse(localStorage.getItem('Mnemonic') || 'null')
    const subkey = JSON.parse(localStorage.getItem('SubKey') || 'null')

    const [keys, setKeys] = useState<Key[]>([])
    const [target, setTarget] = useState<string | null>(null)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [hideDisabledSubKey, setHideDisabledSubKey] = usePreference('hideDisabledSubKey')

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

            {mnemonic && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Alert severity="warning">{t('loginType.masterKey')}</Alert>

                    <Suspense fallback={<>loading...</>}>
                        <SwitchMasterToSub mnemonic={mnemonic} />
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

            {!subkey && !mnemonic && <Alert severity="error">{t('loginType.secret')}</Alert>}

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
                    .filter((key) => key.revokePayload === 'null' || !hideDisabledSubKey)
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
