import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Divider } from '@mui/material'
import type { StreamElementDated } from '../model'
import type { IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { Timeline } from '../components/Timeline/main'
import { StreamInfo } from '../components/StreamInfo'
import { ApplicationContext } from '../App'
import { usePreference } from '../context/PreferenceContext'
import { type Stream } from '@concurrent-world/client'
import PercentIcon from '@mui/icons-material/Percent'
import InfoIcon from '@mui/icons-material/Info'
import { CCDrawer } from '../components/ui/CCDrawer'
import WatchingStreamContextProvider from '../context/WatchingStreamContext'

export interface StreamPageProps {
    messages: IuseObjectList<StreamElementDated>
}

export const StreamPage = memo<StreamPageProps>((props: StreamPageProps): JSX.Element => {
    const client = useApi()
    const appData = useContext(ApplicationContext)
    const pref = usePreference()

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)

    const [writeable, setWriteable] = useState<boolean>(true)

    const targetStreamID = reactlocation.hash.replace('#', '').split(',')[0]
    const [targetStream, setTargetStream] = useState<Stream | null | undefined>(null)

    const [streamInfoOpen, setStreamInfoOpen] = useState<boolean>(false)

    useEffect(() => {
        client.getStream(targetStreamID).then((stream) => {
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
            .finally(() => {
                scrollParentRef.current?.scroll({ top: 0 })
            })
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
                    title={targetStream?.name ?? 'Not Found'}
                    titleIcon={<PercentIcon />}
                    secondaryAction={<InfoIcon />}
                    onTitleClick={() => {
                        scrollParentRef.current?.scroll({ top: 0, behavior: 'smooth' })
                    }}
                    onSecondaryActionClick={() => {
                        setStreamInfoOpen(true)
                    }}
                />
                <Box
                    sx={{
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        overscrollBehaviorY: 'none'
                    }}
                    ref={scrollParentRef}
                >
                    {writeable && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box
                                sx={{
                                    padding: { xs: '8px', sm: '8px 16px' },
                                    display: {
                                        xs: pref.showEditorOnTopMobile ? 'block' : 'none',
                                        sm: pref.showEditorOnTop ? 'block' : 'none'
                                    }
                                }}
                            >
                                <Draft
                                    streamPickerInitial={streams}
                                    streamPickerOptions={streams}
                                    onSubmit={(text: string, destinations: string[], emojis): Promise<Error | null> => {
                                        client
                                            .createCurrent(text, destinations, emojis)
                                            .then(() => {
                                                return null
                                            })
                                            .catch((e) => {
                                                return e
                                            })
                                        return Promise.resolve(null)
                                    }}
                                />
                            </Box>
                            <Divider />
                        </Box>
                    )}
                    <WatchingStreamContextProvider watchingStreams={streamIDs}>
                        <Box
                            sx={{
                                display: 'flex',
                                flex: 1,
                                flexDirection: 'column',
                                py: { xs: 1, sm: 1 },
                                px: { xs: 1, sm: 2 }
                            }}
                        >
                            <Timeline
                                streams={appData.displayingStream}
                                timeline={props.messages}
                                scrollParentRef={scrollParentRef}
                            />
                        </Box>
                    </WatchingStreamContextProvider>
                </Box>
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
