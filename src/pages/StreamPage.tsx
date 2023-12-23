import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Divider } from '@mui/material'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { Timeline } from '../components/Timeline/main'
import { StreamInfo } from '../components/StreamInfo'
import { ApplicationContext } from '../App'
import { usePreference } from '../context/PreferenceContext'
import { type CommonstreamSchema, type Stream } from '@concurrent-world/client'
import PercentIcon from '@mui/icons-material/Percent'
import InfoIcon from '@mui/icons-material/Info'
import { CCDrawer } from '../components/ui/CCDrawer'
import WatchingStreamContextProvider from '../context/WatchingStreamContext'
import { type VListHandle } from 'virtua'

export const StreamPage = memo((): JSX.Element => {
    const client = useApi()
    const appData = useContext(ApplicationContext)

    const [showEditorOnTop] = usePreference('showEditorOnTop')
    const [showEditorOnTopMobile] = usePreference('showEditorOnTopMobile')

    const reactlocation = useLocation()
    const timelineRef = useRef<VListHandle>(null)
    const [writeable, setWriteable] = useState<boolean>(true)

    const targetStreamID = reactlocation.hash.replace('#', '').split(',')[0]
    const [targetStream, setTargetStream] = useState<Stream<CommonstreamSchema> | null | undefined>(null)

    const [streamInfoOpen, setStreamInfoOpen] = useState<boolean>(false)

    useEffect(() => {
        client.getStream<CommonstreamSchema>(targetStreamID).then((stream) => {
            setTargetStream(stream)
        })

        client.api
            .readStream(targetStreamID)
            .then((stream) => {
                if (!stream) {
                    setWriteable(false)
                } else if (stream.author === client.ccid) {
                    setWriteable(true)
                } else if (stream.writer.length === 0) {
                    setWriteable(true)
                } else if (stream.writer.includes(client.ccid)) {
                    setWriteable(true)
                }
            })
            .finally(() => {})
    }, [reactlocation.hash])

    const streams = useMemo(() => {
        return targetStream ? [targetStream] : []
    }, [targetStream])

    const streamIDs = useMemo(() => {
        return targetStream ? [targetStream.id] : []
    }, [targetStream])

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
                    secondaryAction={<InfoIcon />}
                    onTitleClick={() => {
                        timelineRef.current?.scrollToIndex(0, { align: 'start', smooth: true })
                    }}
                    onSecondaryActionClick={() => {
                        setStreamInfoOpen(true)
                    }}
                />
                <WatchingStreamContextProvider watchingStreams={streamIDs}>
                    <Timeline
                        streams={appData.displayingStream}
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
                                            streamPickerInitial={streams}
                                            streamPickerOptions={streams}
                                            onSubmit={async (
                                                text: string,
                                                destinations: string[],
                                                options
                                            ): Promise<Error | null> => {
                                                await client.createCurrent(text, destinations, options).catch((e) => e)
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
            </Box>
            <CCDrawer
                open={streamInfoOpen}
                onClose={() => {
                    setStreamInfoOpen(false)
                }}
            >
                <StreamInfo id={targetStreamID} />
            </CCDrawer>
        </>
    )
})
StreamPage.displayName = 'StreamPage'
