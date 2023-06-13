import { memo, useEffect, useRef, useState } from 'react'
import { Box, Collapse, Divider } from '@mui/material'
import type { StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { useFollow } from '../context/FollowContext'
import { Timeline } from '../components/Timeline/main'
import { StreamInfo } from '../components/StreamInfo'
import { HomeSettings } from '../components/HomeSettings'

export interface TimelinePageProps {
    messages: IuseObjectList<StreamElementDated>
    currentStreams: string[]
    setCurrentStreams: (input: string[]) => void
    setMobileMenuOpen: (state: boolean) => void
}

export const TimelinePage = memo<TimelinePageProps>((props: TimelinePageProps): JSX.Element => {
    const api = useApi()
    const followService = useFollow()

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)

    const [mode, setMode] = useState<string>('compose')
    const [writeable, setWriteable] = useState<boolean>(true)

    const isHome = !reactlocation.hash
    const queriedStreams = reactlocation.hash.replace('#', '').split(',')

    useEffect(() => {
        ;(async () => {
            if (isHome) {
                props.setCurrentStreams(
                    [
                        ...followService.followingStreams,
                        ...(await api.getUserHomeStreams(followService.followingUsers))
                    ].filter((e) => e)
                )
            } else {
                props.setCurrentStreams(queriedStreams)
            }
        })()
        let mymode = followService.bookmarkingStreams.includes(queriedStreams[0]) ? 'compose' : 'info'
        if (queriedStreams.length !== 1) mymode = 'compose'
        if (!reactlocation.hash) mymode = 'home'
        setMode(mymode)

        scrollParentRef.current?.scroll({ top: 0 })
    }, [reactlocation.hash])

    useEffect(() => {
        // check if the all of streams are writable
        if (!reactlocation.hash) return
        ;(async () => {
            const writeable = await Promise.all(
                props.currentStreams.map(async (e) => {
                    const stream = await api.readStream(e)
                    if (!stream) return false
                    if (stream.author === api.userAddress) return true
                    if (stream.writer.length === 0) return true
                    return stream.writer.includes(api.userAddress)
                })
            )
            const result = writeable.every((e) => e)
            setWriteable(result)
            setMode(result ? mode : 'info')
        })()
    }, [props.currentStreams])

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
                location={reactlocation}
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
                    <Collapse in={mode === 'edit'}>
                        <Box sx={{ padding: { xs: '8px', sm: '8px 16px' } }}>
                            <HomeSettings />
                        </Box>
                    </Collapse>
                    <Collapse in={mode === 'info'}>
                        <StreamInfo id={queriedStreams[0]} />
                    </Collapse>
                    <Collapse in={mode === 'compose' || mode === 'home'}>
                        <Box sx={{ padding: { xs: '8px', sm: '8px 16px' } }}>
                            <Draft currentStreams={isHome ? [] : queriedStreams} />
                        </Box>
                    </Collapse>
                    <Divider />
                </Box>
                {(reactlocation.hash === '' || reactlocation.hash === '#') &&
                followService.followingStreams.length === 0 &&
                followService.followingUsers.length === 0 ? (
                    <Box>まだ誰も、どのストリームもフォローしていません。Explorerタブから探しに行きましょう。</Box>
                ) : (
                    <Box sx={{ display: 'flex', flex: 1, padding: { xs: '8px', sm: '8px 16px' } }}>
                        <Timeline
                            streams={props.currentStreams}
                            timeline={props.messages}
                            scrollParentRef={scrollParentRef}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    )
})
TimelinePage.displayName = 'TimelinePage'
