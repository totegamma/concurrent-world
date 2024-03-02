import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Divider, Typography } from '@mui/material'
import { Draft } from '../components/Draft'
import { useParams } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useClient } from '../context/ClientContext'
import { Timeline } from '../components/Timeline/main'
import { StreamInfo } from '../components/StreamInfo'
import { usePreference } from '../context/PreferenceContext'
import { type CommonstreamSchema } from '@concurrent-world/client'
import { CCDrawer } from '../components/ui/CCDrawer'
import WatchingStreamContextProvider from '../context/WatchingStreamContext'
import { type VListHandle } from 'virtua'
import { useGlobalActions } from '../context/GlobalActions'

import PercentIcon from '@mui/icons-material/Percent'
import TuneIcon from '@mui/icons-material/Tune'
import InfoIcon from '@mui/icons-material/Info'
import LockIcon from '@mui/icons-material/Lock'

export const StreamPage = memo((): JSX.Element => {
    const { client } = useClient()
    const { allKnownStreams, postStreams, setPostStreams } = useGlobalActions()

    const { id } = useParams()

    const [showEditorOnTop] = usePreference('showEditorOnTop')
    const [showEditorOnTopMobile] = usePreference('showEditorOnTopMobile')

    const timelineRef = useRef<VListHandle>(null)

    const targetStreamID = id ?? ''
    const targetStream = postStreams[0]

    const [streamInfoOpen, setStreamInfoOpen] = useState<boolean>(false)

    const isOwner = useMemo(() => {
        return targetStream?.author === client.ccid
    }, [targetStream])

    const writeable = useMemo(
        () => isOwner || targetStream?.writer.length === 0 || targetStream?.writer.includes(client.ccid ?? ''),
        [targetStream]
    )

    const readable = useMemo(
        () => isOwner || targetStream?.reader.length === 0 || targetStream?.reader.includes(client.ccid ?? ''),
        [targetStream]
    )

    const nonPublic = useMemo(() => targetStream?.reader.length !== 0 || !targetStream?.visible, [targetStream])

    const streams = useMemo(() => {
        return targetStream ? [targetStream] : []
    }, [targetStream])

    const streamIDs = useMemo(() => {
        return targetStream ? [targetStream.id] : []
    }, [targetStream])

    useEffect(() => {
        client.getStream<CommonstreamSchema>(targetStreamID).then((stream) => {
            if (stream) setPostStreams([stream])
        })
    }, [id])

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    minHeight: '100%',
                    backgroundColor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <TimelineHeader
                    title={targetStream?.payload.name ?? 'Not Found'}
                    titleIcon={<PercentIcon />}
                    secondaryAction={isOwner ? <TuneIcon /> : <InfoIcon />}
                    onTitleClick={() => {
                        timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                    }}
                    onSecondaryActionClick={() => {
                        setStreamInfoOpen(true)
                    }}
                />
                {readable ? (
                    <WatchingStreamContextProvider watchingStreams={streamIDs}>
                        <Timeline
                            streams={streamIDs}
                            ref={timelineRef}
                            header={
                                (writeable && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: {
                                                    xs: showEditorOnTopMobile ? 'block' : 'none',
                                                    sm: showEditorOnTop ? 'block' : 'none'
                                                }
                                            }}
                                        >
                                            <Draft
                                                defaultPostHome={!nonPublic}
                                                streamPickerInitial={streams}
                                                streamPickerOptions={[...new Set([...allKnownStreams, ...streams])]}
                                                onSubmit={async (
                                                    text: string,
                                                    destinations: string[],
                                                    options
                                                ): Promise<Error | null> => {
                                                    await client
                                                        .createCurrent(text, destinations, options)
                                                        .catch((e) => e)
                                                    return null
                                                }}
                                                sx={{
                                                    p: 1
                                                }}
                                            />
                                            <Divider
                                                sx={{
                                                    mb: 1
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )) ||
                                undefined
                            }
                        />
                    </WatchingStreamContextProvider>
                ) : (
                    <Box>
                        <StreamInfo id={targetStreamID} />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <LockIcon
                                sx={{
                                    fontSize: '10rem'
                                }}
                            />
                            <Typography variant="h5">このストリームは鍵がかかっています。</Typography>
                        </Box>
                    </Box>
                )}
            </Box>
            <CCDrawer
                open={streamInfoOpen}
                onClose={() => {
                    setStreamInfoOpen(false)
                }}
            >
                <StreamInfo detailed id={targetStreamID} />
            </CCDrawer>
        </>
    )
})
StreamPage.displayName = 'StreamPage'
