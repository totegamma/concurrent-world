import { Button, Divider, Typography } from '@mui/material'
import { useClient } from '../../context/ClientContext'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import { type CCDocument, Schemas, Sign } from '@concurrent-world/client'

interface v0data {
    content: any[]
}

const v0status = {
    idle: 'バージョン0からのインポート',
    loading: 'インポート中(時間がかかります)',
    success: 'インポート完了！',
    error: 'インポートに失敗しました(consoleログを確認してください)'
}

export function ImportExport(): JSX.Element {
    const { client } = useClient()
    const { t } = useTranslation('', { keyPrefix: 'settings.importexport' })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [v0importStatus, setV0importStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const importFromVersion0 = (backup: v0data): void => {
        if (v0importStatus !== 'idle') return
        if (backup.content.length === 0) return
        if (!client.keyPair) return
        if (!client.ccid) return
        if (!client.user?.homeTimeline) return

        setV0importStatus('loading')
        /*
        {
            "id": "b564cdd8-033e-4e9a-9def-58545369e030",
            "author": "CC707E9Aa446961E6e6C33e5d69d827e5420B69E1f",
            "schema": "https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json",
            "payload": "{\"signer\":\"CC707E9Aa446961E6e6C33e5d69d827e5420B69E1f\",\"type\":\"Message\",\"schema\":\"https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json\",\"body\":{\"body\":\"ねむいわヨ\",\"emojis\":{},\"mentions\":[],\"profileOverride\":{}},\"meta\":{\"client\":\"develop.dqv3bovj4nar0.amplifyapp.com-develop-21543e8\"},\"signedAt\":\"2024-03-12T05:17:48.980Z\",\"keyID\":\"CK548AF905296C91B2BE410A95DC79231533d31cFd\"}",
            "signature": "b1f8f8cc2c5f2044795e5f28c4e449f76e0fe93ca6504386ca609b2f07f8d88c244a60945c85e6e6871796c1b04648fd000b3100c6c66fe97e6a6d1ac5ada9dc01",
            "cdate": "2024-03-12T05:17:48.98Z",
            "streams": [
                "ci8qvhep9dcpltmfq3fg@hub.concurrent.world",
                "cndaednuhc2a8j8f19bg@dev.concurrent.world"
            ]
        }

        {
            "signer": "CC707E9Aa446961E6e6C33e5d69d827e5420B69E1f",
            "type": "Message",
            "schema": "https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json",
            "body": {
                "body": "ねむいわヨ",
                "emojis": {},
                "mentions": [],
                "profileOverride": {}
            },
            "meta": {
                "client": "develop.dqv3bovj4nar0.amplifyapp.com-develop-21543e8"
            },
            "signedAt": "2024-03-12T05:17:48.980Z",
            "keyID": "CK548AF905296C91B2BE410A95DC79231533d31cFd"
        }

        to

        {
            "signer": "con156ylfvc07pf23j6n96jgg9yk6dhkdrngp96g0t",
            "type": "message",
            "schema": "https://schema.concrnt.world/m/markdown.json",
            "body": {
                "body": "Okay!!",
                "emojis": {},
                "mentions": [],
                "profileOverride": {}
            },
            "meta": {
                "client": "localhost-v1dev-b9e1521"
            },
            "timelines": [
                "world.concrnt.t-home@con156ylfvc07pf23j6n96jgg9yk6dhkdrngp96g0t"
            ],
            "signedAt": "2024-05-04T16:55:42.104Z"
        }
        */

        const logs = []
        for (const message of backup.content) {
            const payload = JSON.parse(message.payload)

            if (
                payload.schema !==
                'https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json'
            ) {
                console.error('unsupported schema', payload.schema)
                continue
            }

            const doc: CCDocument.Message<any> = {
                signer: client.ccid,
                type: 'message',
                schema: Schemas.markdownMessage,
                body: payload.body,
                meta: payload.meta,
                timelines: [client.user.homeTimeline],
                signedAt: payload.signedAt
            }

            const document = JSON.stringify(doc)
            const signature = Sign(client.keyPair.privatekey, document)

            const entries = [message.id, client.ccid, signature, document]
            const entry = entries.join(' ')
            logs.push(entry)
        }

        const log = logs.join('\n')
        client.api
            .fetchWithCredential(
                client.api.host,
                '/api/v1/repository',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: log
                },
                1000 * 60 * 10 // 10 minutes
            )
            .then((res) => {
                if (res.ok) {
                    console.log('imported')
                    res.json().then((data) => {
                        console.log(data)
                    })
                    setV0importStatus('success')
                } else {
                    console.error('failed to import')
                    setV0importStatus('error')
                }
            })
    }

    return (
        <>
            <Typography variant="h3">{t('export')}</Typography>

            <Button>コミットログのダウンロード</Button>

            <Divider
                sx={{
                    marginY: 2
                }}
            />

            <Typography variant="h3">{t('import')}</Typography>

            <Button disabled>コミットログのインポート</Button>

            <Typography variant="h4">その他</Typography>
            <input
                hidden
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                            const contents = e.target?.result
                            if (contents) {
                                const data = JSON.parse(contents as string) as v0data
                                importFromVersion0(data)
                            }
                        }
                        reader.readAsText(file)
                    }
                }}
            />
            <Button
                disabled={v0importStatus === 'loading'}
                color={v0importStatus === 'error' ? 'error' : v0importStatus === 'success' ? 'success' : 'primary'}
                onClick={() => {
                    fileInputRef.current?.click()
                }}
            >
                {v0status[v0importStatus]}
            </Button>
        </>
    )
}
