import { Box, Button, Divider, FormControlLabel, FormGroup, Paper, Switch, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useClient } from '../context/ClientContext'
import { type CommunityTimelineSchema, type CoreTimeline } from '@concurrent-world/client'
import { CCEditor } from './ui/cceditor'
import { useSnackbar } from 'notistack'
import { CCWallpaper } from './ui/CCWallpaper'
import { WatchButton } from './WatchButton'
import { PolicyEditor } from './ui/PolicyEditor'

export interface StreamInfoProps {
    id: string
    detailed?: boolean
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

    return (
        <>
            <CCWallpaper
                override={stream.document.body.banner}
                sx={{
                    height: '150px'
                }}
                innerSx={{
                    display: 'flex',
                    padding: 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Paper sx={{ flex: 2, padding: 2 }}>
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
                    <Typography variant="caption">{props.id}</Typography>
                    <Divider />
                    <Typography>{stream.document.body.description || 'まだ説明はありません'}</Typography>
                </Paper>
            </CCWallpaper>
            {props.detailed && (
                <>
                    {isAuthor ? (
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
                            ※基本的に変更する必要はありません。
                            <TextField
                                label="Schema"
                                value={schemaDraft}
                                onChange={(e) => {
                                    setSchemaDraft(e.target.value)
                                }}
                            />
                            <Box>
                                <Typography variant="h3">属性</Typography>
                                <CCEditor
                                    schemaURL={schemaDraft}
                                    value={stream.document.body}
                                    setValue={(e) => {
                                        setDocumentBody(e)
                                    }}
                                />
                            </Box>
                            <Typography variant="h3">ポリシー</Typography>
                            <TextField
                                label="Policy"
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
                    ) : (
                        <></>
                    )}
                </>
            )}
        </>
    )
}
