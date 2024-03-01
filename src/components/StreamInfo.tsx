import { Box, Button, Divider, FormControlLabel, FormGroup, Paper, Switch, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useClient } from '../context/ClientContext'
import { type User, type CommonstreamSchema, type CoreStream } from '@concurrent-world/client'
import { CCEditor } from './ui/cceditor'
import { useSnackbar } from 'notistack'
import { AddListButton } from './AddListButton'
import { CCWallpaper } from './ui/CCWallpaper'
import { UserPicker } from './ui/UserPicker'
import { StreamUserList } from './StreamUserList'

export interface StreamInfoProps {
    id: string
    detailed?: boolean
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()
    const [stream, setStream] = useState<CoreStream<CommonstreamSchema>>()
    const isAuthor = stream?.author === client.ccid

    const [visible, setVisible] = useState(false)

    const [schemaDraft, setSchemaDraft] = useState('')

    const [writers, setWriters] = useState<User[]>([])
    const [readers, setReaders] = useState<User[]>([])

    const readable = useMemo(
        () =>
            stream &&
            (stream.author === client.ccid || stream.reader.length === 0 || stream.reader.includes(client.ccid ?? '')),
        [client, stream]
    )

    useEffect(() => {
        if (!props.id) return
        client.api.getStream(props.id).then((e) => {
            if (!e) return
            setStream(e)
            setVisible(e.visible)
            setSchemaDraft(e.schema)

            Promise.all(e.writer.map((e) => client.getUser(e))).then((e) => {
                setWriters(e.filter((e) => e) as User[])
            })

            Promise.all(e.reader.map((e) => client.getUser(e))).then((e) => {
                setReaders(e.filter((e) => e) as User[])
            })
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
                    writer: writers.map((e) => e.ccid),
                    reader: readers.map((e) => e.ccid),
                    visible
                })
                .then((_) => {
                    enqueueSnackbar('更新しました', { variant: 'success' })
                })
                .catch((_) => {
                    enqueueSnackbar('更新に失敗しました', { variant: 'error' })
                })
        },
        [client.api, stream, writers, readers, schemaDraft, props.id, visible, enqueueSnackbar]
    )

    if (!stream) {
        return <>stream information not found</>
    }

    return (
        <>
            <CCWallpaper
                override={stream.payload.banner}
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
                        <Typography variant="h1">{stream.payload.name}</Typography>
                        <AddListButton stream={props.id} />
                    </Box>
                    <Typography variant="caption">{props.id}</Typography>
                    <Divider />
                    <Typography>{stream.payload.description || 'まだ説明はありません'}</Typography>
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
                            <Typography>writer</Typography>
                            <UserPicker selected={writers} setSelected={setWriters} />
                            <Typography>reader</Typography>
                            <UserPicker selected={readers} setSelected={setReaders} />
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
                    ) : (
                        readable && <StreamUserList writers={writers} readers={readers} />
                    )}
                </>
            )}
        </>
    )
}
