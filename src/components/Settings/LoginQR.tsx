import { Alert, Button, Tab, Tabs, Typography } from '@mui/material'
import SubkeyInfo from '../SubkeyInfo'
import { useState } from 'react'
import { ComputeCKID, generateIdentity } from '@concurrent-world/client'
import { useApi } from '../../context/api'

export function LoginQR(): JSX.Element {
    const client = useApi()
    const subkey = JSON.parse(localStorage.getItem('SubKey') || 'null')
    const [tab, setTab] = useState(0)

    const [generated, setGenerated] = useState<null | string>(null)

    return (
        <>
            <Tabs
                value={tab}
                onChange={(_, newValue) => {
                    setTab(newValue)
                }}
            >
                <Tab label="新しく作成" />
                <Tab label="この端末のキーを表示" />
            </Tabs>
            {tab === 0 && (
                <>
                    <Alert severity="warning">
                        ここで作成したサブキーの認証情報は、この画面を離れると再度表示されません。使わなかった場合作り直しになってしまう為、必要な時のみ生成して、必要に応じてメモを取るなどしてください。
                    </Alert>

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
                            サブキーを新しく生成する
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

            <Typography>アカウントが持つキーのリストは設定のIdentityページから確認できます。</Typography>
        </>
    )
}
