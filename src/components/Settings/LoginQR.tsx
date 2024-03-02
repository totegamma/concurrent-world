import { Alert, Button, Tab, Tabs, Typography } from '@mui/material'
import SubkeyInfo from '../SubkeyInfo'
import { useState } from 'react'
import { ComputeCKID, generateIdentity } from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import { useTranslation } from 'react-i18next'

export function LoginQR(): JSX.Element {
    const { client } = useClient()
    const subkey = JSON.parse(localStorage.getItem('SubKey') || 'null')
    const [tab, setTab] = useState(0)

    const [generated, setGenerated] = useState<null | string>(null)

    const { t } = useTranslation('', { keyPrefix: 'settings.qr' })

    return (
        <>
            <Tabs
                value={tab}
                onChange={(_, newValue) => {
                    setTab(newValue)
                }}
            >
                <Tab label={t('createNew')} />
                <Tab label={t('showInstalled')} />
            </Tabs>
            {tab === 0 && (
                <>
                    <Alert severity="warning">{t('tip1')}</Alert>

                    {generated ? (
                        <>
                            <SubkeyInfo subkey={generated} />
                        </>
                    ) : (
                        <Button
                            onClick={() => {
                                const newIdentity = generateIdentity()

                                const ckid = ComputeCKID(newIdentity.publicKey)
                                console.log('newkey: ', ckid)

                                client.api
                                    .enactSubkey(ckid)
                                    .then(() => {
                                        console.log('subkey enacted')
                                        const subkey = `concurrent-subkey ${newIdentity.privateKey} ${client.ccid}@${client.host} ${client.user?.profile?.payload.body.username}`
                                        setGenerated(subkey)
                                    })
                                    .catch((e) => {
                                        console.log('error: ', e)
                                    })
                            }}
                        >
                            {t('createNewSubKey')}
                        </Button>
                    )}
                </>
            )}
            {tab === 1 && (
                <>
                    {subkey && <SubkeyInfo subkey={subkey} />}
                    {!subkey && <p>この端末はサブキーでログインしていません</p>}
                </>
            )}

            <Typography>{t('tip2')}</Typography>
        </>
    )
}
