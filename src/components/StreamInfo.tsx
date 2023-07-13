import { Box, Button, Divider, Modal, Paper, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { Schemas, type Commonstream, type CoreStream } from '@concurrent-world/client'
import Background from '../resources/defaultbg.png'
import { CCEditor } from './cceditor'
import { useSnackbar } from 'notistack'
import { usePreference } from '../context/PreferenceContext'

export interface StreamInfoProps {
    id: string
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const client = useApi()
    const pref = usePreference()
    const { enqueueSnackbar } = useSnackbar()
    const [stream, setStream] = useState<CoreStream<Commonstream>>()
    const bookmarking = pref.bookmarkingStreams.includes(props.id)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const isAuthor = stream?.author === client.ccid
    const isMaintainer = stream?.maintainer.includes(client.ccid)

    const [writerDraft, setWriterDraft] = useState('')
    const [readerDraft, setReaderDraft] = useState('')

    useEffect(() => {
        if (!props.id) return
        client.api.readStream(props.id).then((e) => {
            if (!e) return
            setStream(e)
            setWriterDraft(e.writer.join('\n'))
            setReaderDraft(e.reader.join('\n'))
        })
    }, [props.id])

    const updateStream = useCallback(
        (body: Commonstream) => {
            if (!stream) return
            client.api
                .updateStream(props.id, {
                    schema: Schemas.commonstream,
                    body,
                    maintainer: stream.maintainer,
                    writer: writerDraft.split('\n').filter((e) => e),
                    reader: readerDraft.split('\n').filter((e) => e)
                })
                .then((_) => {
                    enqueueSnackbar('更新しました', { variant: 'success' })
                })
                .catch((_) => {
                    enqueueSnackbar('更新に失敗しました', { variant: 'error' })
                })
        },
        [client.api, stream, writerDraft, readerDraft]
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
                    backgroundImage: `url(${Background})`,
                    backgroundPosition: 'center',
                    objectFit: 'cover',
                    gap: '10px'
                }}
            >
                <Paper sx={{ flex: 2, padding: '20px' }}>
                    <Typography variant="h1">{stream.payload.body.name}</Typography>
                    <Typography variant="caption">{props.id}</Typography>
                    <Divider />
                    <Typography>{stream.payload.body.description || 'まだ説明はありません'}</Typography>
                </Paper>
                <Box sx={{ display: 'flex', flex: 1, flexFlow: 'column', gap: '10px' }}>
                    {bookmarking ? (
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                pref.unbookmarkStream(props.id)
                            }}
                            sx={{ height: '50px' }}
                        >
                            Favorited
                        </Button>
                    ) : (
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                pref.bookmarkStream(props.id)
                            }}
                            sx={{ height: '50px' }}
                        >
                            Favorite
                        </Button>
                    )}
                    {(isAuthor || isMaintainer) && (
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                setSettingsOpen(true)
                            }}
                            sx={{ height: '50px' }}
                        >
                            Stream Setting
                        </Button>
                    )}
                </Box>
            </Box>
            <Modal
                open={settingsOpen}
                onClose={(): void => {
                    setSettingsOpen(false)
                }}
            >
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px'
                    }}
                >
                    <Typography variant="h2">{stream.payload.body.name}</Typography>
                    <Divider sx={{ mb: '20px' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Typography variant="h3">権限</Typography>
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
                        <Box>
                            <Typography>空の場合パブリックになります。</Typography>
                            <Typography>改行区切りで複数人指定できます。</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h3">属性</Typography>
                            <CCEditor
                                schemaURL={Schemas.commonstream}
                                init={stream.payload.body}
                                onSubmit={updateStream}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Modal>
        </>
    )
}
