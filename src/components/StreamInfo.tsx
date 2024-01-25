import { Box, Button, Divider, FormControlLabel, FormGroup, Paper, Switch, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { type CommonstreamSchema, type CoreStream } from '@concurrent-world/client'
import Background from '../resources/defaultbg.png'
import { CCEditor } from './ui/cceditor'
import { useSnackbar } from 'notistack'
import { AddListButton } from './AddListButton'

export interface StreamInfoProps {
    id: string
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const client = useApi()
    const { enqueueSnackbar } = useSnackbar()
    const [stream, setStream] = useState<CoreStream<CommonstreamSchema>>()
    const isAuthor = stream?.author === client.ccid

    const [visible, setVisible] = useState(false)
    const [writerDraft, setWriterDraft] = useState('')
    const [readerDraft, setReaderDraft] = useState('')

    const [schemaDraft, setSchemaDraft] = useState('')

    useEffect(() => {
        if (!props.id) return
        client.api.getStream(props.id).then((e) => {
            if (!e) return
            setStream(e)
            setVisible(e.visible)
            setWriterDraft(e.writer.join('\n'))
            setReaderDraft(e.reader.join('\n'))
            setSchemaDraft(e.schema)
        })
    }, [props.id])

    const updateStream = useCallback(
        (payload: CommonstreamSchema) => {
            if (!stream) return
            client.api
                .updateStream({
                    ...stream,
                    schema: schemaDraft,
                    payload,
                    writer: writerDraft.split('\n').filter((e) => e),
                    reader: readerDraft.split('\n').filter((e) => e),
                    visible
                })
                .then((_) => {
                    enqueueSnackbar('更新しました', { variant: 'success' })
                })
                .catch((_) => {
                    enqueueSnackbar('更新に失敗しました', { variant: 'error' })
                })
        },
        [client.api, stream, writerDraft, readerDraft, schemaDraft, props.id, visible, enqueueSnackbar]
    )

    if (!stream) {
        return <>stream information not found</>
    }

    return (
        <>
            <Box
                sx={{
                    padding: '20px',
                    display: 'flex',
                    backgroundImage: `url(${stream.payload.banner || Background})`,
                    backgroundPosition: 'center',
                    objectFit: 'cover',
                    gap: '10px'
                }}
            >
                <Paper sx={{ flex: 2, padding: '20px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <Typography variant="h1">{stream.payload.name}</Typography>
                        <AddListButton stream={props.id} />
                    </Box>
                    <Typography variant="caption">{props.id}</Typography>
                    <Divider />
                    <Typography>{stream.payload.description || 'まだ説明はありません'}</Typography>
                </Paper>
            </Box>
            {isAuthor && (
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
                        <Typography>改行区切りで複数人指定できます。</Typography>
                    </Box>
                    <TextField
                        label="writer"
                        multiline
                        value={writerDraft}
                        onChange={(e) => {
                            setWriterDraft(e.target.value)
                        }}
                    />
                    <TextField
                        label="reader"
                        multiline
                        value={readerDraft}
                        onChange={(e) => {
                            setReaderDraft(e.target.value)
                        }}
                    />
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
                        <CCEditor schemaURL={schemaDraft} init={stream.payload} onSubmit={updateStream} />
                    </Box>
                    <Button
                        color="error"
                        onClick={() => {
                            client.api.deleteStream(props.id).then((_) => {
                                enqueueSnackbar('削除しました', { variant: 'success' })
                            })
                        }}
                    >
                        削除
                    </Button>
                </Box>
            )}
        </>
    )
}
