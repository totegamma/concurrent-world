import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Collapse, Divider } from '@mui/material'
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

export interface TimelinePageProps {
    messages: IuseObjectList<StreamElementDated>
    setMobileMenuOpen: (state: boolean) => void
}

export const TimelinePage = memo<TimelinePageProps>((props: TimelinePageProps): JSX.Element => {
    const client = useApi()
    const appData = useContext(ApplicationContext)
    const pref = usePreference()

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)

    const [mode, setMode] = useState<'compose' | 'info'>('compose')
    const [writeable, setWriteable] = useState<boolean>(true)

    const targetStreamID = reactlocation.hash.replace('#', '').split(',')[0]
    const [targetStream, setTargetStream] = useState<Stream | null | undefined>(null)

    useEffect(() => {
        client.getStream(targetStreamID).then((stream) => {
            setTargetStream(stream)
        })

        client.api
            .readStream(targetStreamID)
            .then((stream) => {
                if (!stream) {
                    setWriteable(false)
                    setMode('info')
                } else if (stream.author === client.ccid) {
                    setWriteable(true)
                    setMode('compose')
                } else if (stream.writer.length === 0) {
                    setWriteable(true)
                    setMode('compose')
                } else if (stream.writer.includes(client.ccid)) {
                    setWriteable(true)
                    setMode('compose')
                }
            })
            .finally(() => {
                scrollParentRef.current?.scroll({ top: 0 })
            })
    }, [reactlocation.hash])

    const streams = useMemo(() => {
        return targetStream ? [targetStream] : []
    }, [targetStream])

    return (
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
                setMobileMenuOpen={props.setMobileMenuOpen}
                scrollParentRef={scrollParentRef}
                mode={mode}
                setMode={setMode}
                writeable={writeable}
            />
            <Box
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto'
                }}
                ref={scrollParentRef}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Collapse in={mode === 'info'}>
                        <StreamInfo id={targetStreamID} />
                    </Collapse>
                    <Collapse in={mode === 'compose'}>
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
                                onSubmit={(text: string, destinations: string[]): Promise<Error | null> => {
                                    client
                                        .createCurrent(text, destinations)
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
                    </Collapse>
                    <Divider />
                </Box>
                <Box sx={{ display: 'flex', flex: 1, py: { xs: 1, sm: 1 }, px: { xs: 1, sm: 2 } }}>
                    <Timeline
                        streams={appData.displayingStream}
                        timeline={props.messages}
                        scrollParentRef={scrollParentRef}
                    />
                </Box>
            </Box>
        </Box>
    )
})
TimelinePage.displayName = 'TimelinePage'
