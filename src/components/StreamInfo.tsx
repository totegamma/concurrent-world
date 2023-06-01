import { Box, Button, Divider, Paper, Typography } from '@mui/material'
import type { Commonstream } from '../schemas/commonstream'
import { useEffect, useState } from 'react'
import { useApi } from '../context/api'
import type { Stream } from '../model'
import { useFollow } from '../context/FollowContext'
import Background from '../resources/defaultbg.png'

export interface StreamInfoProps {
    id: string
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const api = useApi()
    const followService = useFollow()
    const [stream, setStream] = useState<Stream<Commonstream>>()
    const bookmarking = followService.bookmarkingStreams.includes(props.id)

    useEffect(() => {
        api.readStream(props.id).then((e) => {
            setStream(e)
        })
    }, [props.id])

    return (
        <>
            {stream ? (
                <Box
                    sx={{
                        padding: '20px',
                        display: 'flex',
                        backgroundImage: `url(${Background})`,
                        backgroundPosition: 'center',
                        objectFit: 'cover'
                    }}
                >
                    <Paper sx={{ flex: 1, padding: '20px' }}>
                        <Typography variant="h1">{stream.payload.body.name}</Typography>
                        <Typography variant="caption">{props.id}</Typography>
                        <Divider />
                        <Typography>{stream.payload.body.description || 'まだ説明はありません'}</Typography>
                    </Paper>
                    <Box sx={{ display: 'flex', flex: 1, flexFlow: 'row-reverse' }}>
                        {bookmarking ? (
                            <Button
                                variant={'outlined'}
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
                    </Box>
                </Box>
            ) : (
                <Box></Box>
            )}
        </>
    )
}
