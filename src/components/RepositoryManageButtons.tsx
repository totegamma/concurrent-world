import { useRef, useState } from 'react'
import { useClient } from '../context/ClientContext'
import { Button, TextField } from '@mui/material'
import { type CCDocument, Schemas, Sign } from '@concurrent-world/client'

interface v0data {
    content: any[]
}

const status = {
    idle: 'レポジトリデータのインポート',
    loading: 'インポート中(時間がかかります)',
    success: 'インポート完了！',
    error: 'インポートに失敗しました(consoleログを確認してください)'
}

const v0status = {
    idle: 'バージョン0からのインポート',
    loading: 'インポート中(時間がかかります)',
    success: 'インポート完了！',
    error: 'インポートに失敗しました(consoleログを確認してください)'
}

export function RepositoryImportButton(props: { domain?: string; onImport?: (err: string) => void }): JSX.Element {
    const { client } = useClient()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [sourceDomain, setSourceDomain] = useState<string>('')
    const [progress, setProgress] = useState<string>('')

    const target = props.domain ?? client.host

    const importRepo = async (data: string): void => {
        if (importStatus !== 'idle') return

        setImportStatus('loading')

        const lines = data.split('\n')
        const chunks = []
        let chunk = ''
        lines.forEach((line, index) => {
            chunk += line + '\n'
            if ((index + 1) % 100 === 0) {
                chunks.push(chunk)
                chunk = ''
            }
        })

        if (chunk.length > 0) {
            chunks.push(chunk)
        }

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            await client.api
                .fetchWithCredential(
                    target,
                    '/api/v1/repository?from=' + sourceDomain,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        body: chunk
                    },
                    1000 * 60 * 10 // 10 minutes
                )
                .then((res) => {
                    if (res.ok) {
                        setProgress(`imported ${i}/${chunks.length}`)
                        res.json().then((data) => {
                            console.log('imported', i, data)
                        })
                    } else {
                        console.error('failed to import')
                        setImportStatus('error')
                        props.onImport?.(`failed to import: ${res.statusText}`)
                    }
                })
                .catch((e) => {
                    console.error(e)
                    setImportStatus('error')
                    props.onImport?.(`failed to import: ${e}`)
                })
        }

        console.log('imported')
        setImportStatus('success')
        props.onImport?.('')
    }

    return (
        <>
            <input
                hidden
                type="file"
                accept=".txt"
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
            <TextField
                label="インポート元ドメイン(オプション)"
                placeholder="example.com"
                value={sourceDomain}
                onChange={(e) => {
                    setSourceDomain(e.target.value)
                }}
            />
            <Button
                disabled={importStatus === 'loading'}
                color={importStatus === 'error' ? 'error' : importStatus === 'success' ? 'success' : 'primary'}
                onClick={() => {
                    fileInputRef.current?.click()
                }}
            >
                {status[importStatus] + (importStatus === 'loading' ? `(${progress})` : '')}
            </Button>
        </>
    )
}

export function V0RepositoryImportButton(): JSX.Element {
    const { client } = useClient()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const importFromVersion0 = (backup: v0data): void => {
        if (importStatus !== 'idle') return
        if (backup.content.length === 0) return
        if (!client.keyPair) return
        if (!client.ccid) return
        if (!client.user?.homeTimeline) return

        setImportStatus('loading')

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
                    setImportStatus('success')
                } else {
                    console.error('failed to import')
                    setImportStatus('error')
                }
            })
    }

    return (
        <>
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
                disabled={importStatus === 'loading'}
                color={importStatus === 'error' ? 'error' : importStatus === 'success' ? 'success' : 'primary'}
                onClick={() => {
                    fileInputRef.current?.click()
                }}
            >
                {v0status[importStatus]}
            </Button>
        </>
    )
}

export function RepositoryExportButton(): JSX.Element {
    const { client } = useClient()
    return (
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
    )
}
