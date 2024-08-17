import {
    Box,
    Button,
    Divider,
    FormControlLabel,
    FormGroup,
    Paper,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useClient } from '../context/ClientContext'
import { type CommunityTimelineSchema, type CoreTimeline } from '@concurrent-world/client'
import { CCEditor } from './ui/cceditor'
import { useSnackbar } from 'notistack'
import { CCWallpaper } from './ui/CCWallpaper'
import { WatchButton } from './WatchButton'
import { PolicyEditor } from './ui/PolicyEditor'
import { CCUserChip } from './ui/CCUserChip'

export interface StreamInfoProps {
    id: string
    detailed?: boolean
    writers?: string[]
    readers?: string[]
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()
    const [stream, setStream] = useState<CoreTimeline<CommunityTimelineSchema>>()
    const isAuthor = stream?.author === client.ccid

    const [visible, setVisible] = useState(false)
    const [schemaDraft, setSchemaDraft] = useState('')
    const [policyDraft, setPolicyDraft] = useState<string | undefined>(undefined)

    const [documentBody, setDocumentBody] = useState<CommunityTimelineSchema | undefined>(stream?.document.body)
    const [policyParams, setPolicyParams] = useState<string | undefined>()

    const [tab, setTab] = useState<'info' | 'edit'>('info')

    useEffect(() => {
        if (!props.id) return
        client.api.getTimeline(props.id).then((e) => {
            if (!e) return
            setStream(e)
            setDocumentBody(e.document.body)
            setPolicyParams(e.policyParams)
            setVisible(e.indexable)
            setSchemaDraft(e.schema)
            setPolicyDraft(e.policy || '')
        })
    }, [props.id])

    const updateStream = useCallback(() => {
        console.log('policyDraft', policyDraft)
        console.log('policyParams', policyParams)
        if (!stream) return
        client.api
            .upsertTimeline(schemaDraft, documentBody, {
                id: props.id,
                indexable: visible,
                domainOwned: false,
                policy: policyDraft,
                policyParams
            })
            .then((_) => {
                enqueueSnackbar('更新しました', { variant: 'success' })
            })
            .catch((_) => {
                enqueueSnackbar('更新に失敗しました', { variant: 'error' })
            })
    }, [client.api, stream, schemaDraft, props.id, visible, enqueueSnackbar, documentBody, policyDraft, policyParams])

    if (!stream) {
        return <>stream information not found</>
    }

    const settingValid =
        schemaDraft.startsWith('https://') && (policyDraft === '' || policyDraft?.startsWith('https://'))

    return (
        <>
            <CCWallpaper
                override={stream.document.body.banner}
                sx={{
                    minHeight: '150px'
                }}
                innerSx={{
                    display: 'flex',
                    padding: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Paper sx={{ flex: 2, padding: 2, userSelect: 'text' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Typography variant="h1">{stream.document.body.name}</Typography>
                        <WatchButton minimal timelineID={props.id} />
                    </Box>
                    <Typography
                        variant="caption"
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                        onClick={() => {
                            navigator.clipboard.writeText(props.id)
                            enqueueSnackbar('IDをコピーしました', { variant: 'success' })
                        }}
                    >
                        {props.id}
                    </Typography>
                    <Divider />
                    <Typography>{stream.document.body.description || 'まだ説明はありません'}</Typography>
                </Paper>
            </CCWallpaper>
            {props.detailed && (
                <>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => {
                            setTab(v)
                        }}
                    >
                        <Tab value="info" label={'情報'} />
                        <Tab value="edit" label={'編集'} disabled={!isAuthor} />
                    </Tabs>
                    <Divider />

                    {tab === 'info' && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                p: 1
                            }}
                        >
                            <Typography variant="h3">Creator</Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap'
                                }}
                            >
                                <CCUserChip avatar ccid={stream.author} />
                            </Box>
                            {props.writers && props.writers.length > 0 && (
                                <>
                                    <Typography variant="h3">Writer</Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        {props.writers.map((e) => (
                                            <CCUserChip avatar key={e} ccid={e} />
                                        ))}
                                    </Box>
                                </>
                            )}

                            {props.readers && props.readers.length > 0 && (
                                <>
                                    <Typography variant="h3">Reader</Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        {props.readers.map((e) => (
                                            <CCUserChip avatar key={e} ccid={e} />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                    {tab === 'edit' && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                p: 1
                            }}
                        >
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={visible}
                                            onChange={(e) => {
                                                setVisible(e.target.checked)
                                            }}
                                        />
                                    }
                                    label="検索可能"
                                />
                            </FormGroup>
                            <Typography variant="h3">権限</Typography>
                            <Box>
                                <Typography>空の場合パブリックになります。</Typography>
                            </Box>
                            <Typography variant="h3">スキーマ</Typography>
                            <TextField
                                label="Schema"
                                error={!schemaDraft?.startsWith('https://')}
                                helperText="JsonSchema URLを入力。基本的に変更する必要はありません"
                                value={schemaDraft}
                                onChange={(e) => {
                                    setSchemaDraft(e.target.value)
                                }}
                            />
                            <Box>
                                <Typography variant="h3">属性</Typography>
                                <CCEditor
                                    schemaURL={schemaDraft}
                                    value={documentBody}
                                    setValue={(e) => {
                                        setDocumentBody(e)
                                    }}
                                />
                            </Box>
                            <Typography variant="h3">ポリシー</Typography>
                            <TextField
                                label="Policy"
                                error={!policyDraft?.startsWith('https://') && policyDraft !== ''}
                                helperText={
                                    policyDraft === ''
                                        ? '空の場合はデフォルトポリシーが適用されます'
                                        : 'PolicyJSONのURLを入力。'
                                }
                                value={policyDraft}
                                onChange={(e) => {
                                    setPolicyDraft(e.target.value)
                                }}
                            />
                            {policyDraft && (
                                <Box>
                                    <Typography variant="h3">ポリシーパラメーター</Typography>
                                    <PolicyEditor
                                        policyURL={policyDraft}
                                        value={policyParams}
                                        setValue={(e) => {
                                            setPolicyParams(e)
                                        }}
                                    />
                                </Box>
                            )}
                            <Button
                                onClick={() => {
                                    updateStream()
                                }}
                                disabled={!settingValid}
                            >
                                保存
                            </Button>
                            <Button
                                color="error"
                                onClick={() => {
                                    client.api.deleteTimeline(props.id.split('@')[0]).then((_) => {
                                        enqueueSnackbar('削除しました', { variant: 'success' })
                                    })
                                }}
                            >
                                削除
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </>
    )
}
