import { Box, Button, Divider, Modal, Paper, Typography } from '@mui/material'
import type { Commonstream } from '../schemas/commonstream'
import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../context/api'
import type { Stream } from '../model'
import { useFollow } from '../context/FollowContext'
import Background from '../resources/defaultbg.png'
import { CCEditor } from './cceditor'
import { Schemas } from '../schemas'

export interface StreamInfoProps {
    id: string
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const api = useApi()
    const followService = useFollow()
    const [stream, setStream] = useState<Stream<Commonstream>>()
    const bookmarking = followService.bookmarkingStreams.includes(props.id)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const isAuthor = stream?.author === api.userAddress
    const isMaintainer = stream?.maintainer.includes(api.userAddress)

    useEffect(() => {
        api.readStream(props.id).then((e) => {
            setStream(e)
        })
    }, [props.id])

    const updateStream = useCallback(
        (body: Commonstream) => {
            if (!stream) return
            api.updateStream(props.id, {
                schema: Schemas.commonstream,
                body,
                maintainer: stream.maintainer,
                writer: stream.writer,
                reader: stream.reader
            })
        },
        [api, stream]
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
                                followService.unbookmarkStream(props.id)
                            }}
                            sx={{ height: '50px' }}
                        >
                            Favorited
                        </Button>
                    ) : (
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                followService.bookmarkStream(props.id)
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
                    <Divider />
                    <CCEditor schemaURL={Schemas.commonstream} init={stream.payload.body} onSubmit={updateStream} />
                </Paper>
            </Modal>
        </>
    )
}
