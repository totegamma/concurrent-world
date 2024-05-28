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
    const v0FileInputRef = useRef<HTMLInputElement>(null)
    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [v0importStatus, setV0importStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const importRepo = (data: string): void => {
        if (importStatus !== 'idle') return

        setImportStatus('loading')
        client.api
            .fetchWithCredential(
                client.api.host,
                '/api/v1/repository',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: data
                },
                1000 * 60 * 10 // 10 minutes
            )
            .then((res) => {
                if (res.ok) {
                    console.log('imported')
                    res.json().then((data) => {
                        console.log(data)
                        setImportStatus('success')
                    })
                } else {
                    console.error('failed to import')
                    setImportStatus('error')
                }
            })
            .catch((e) => {
                console.error(e)
                setImportStatus('error')
            })
    }

    const importFromVersion0 = (backup: v0data): void => {
        if (v0importStatus !== 'idle') return
        if (backup.content.length === 0) return
        if (!client.keyPair) return
        if (!client.ccid) return
        if (!client.user?.homeTimeline) return

        setV0importStatus('loading')

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

            <Button
                onClick={() => {
                    client.api
                        .fetchWithCredential(client.host, '/api/v1/repository', {}, 60000)
                        .then((res) => res.blob())
                        .then((blob) => {
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download =
                                (client.user?.profile?.username ?? 'anonymous') +
                                '-backup-' +
                                new Date().toLocaleDateString() +
                                '.txt'
                            a.click()
                            window.URL.revokeObjectURL(url)
                        })
                }}
            >
                レポジトリデータのエクスポート
            </Button>

            <Divider
                sx={{
                    marginY: 2
                }}
            />

            <Typography variant="h3">{t('import')}</Typography>

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
                                importRepo(contents as string)
                            }
                        }
                        reader.readAsText(file)
                    }
                }}
            />
            <Button
                disabled={importStatus === 'loading'}
                color={importStatus === 'error' ? 'error' : importStatus === 'success' ? 'success' : 'primary'}
                onClick={() => {
                    fileInputRef.current?.click()
                }}
            >
                レポジトリデータのインポート
            </Button>

            <Divider
                sx={{
                    marginY: 2
                }}
            />

            <Typography variant="h3">その他</Typography>
            <input
                hidden
                type="file"
                accept=".json"
                ref={v0FileInputRef}
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
                    v0FileInputRef.current?.click()
                }}
            >
                {v0status[v0importStatus]}
            </Button>
        </>
    )
}
