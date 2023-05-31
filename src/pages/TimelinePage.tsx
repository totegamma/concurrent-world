import { memo, useEffect, useRef } from 'react'
import { Box, Divider, useTheme } from '@mui/material'
import type { StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { useFollow } from '../context/FollowContext'
import { Timeline } from '../components/Timeline/main'

export interface TimelinePageProps {
    messages: IuseObjectList<StreamElementDated>
    currentStreams: string[]
    setCurrentStreams: (input: string[]) => void
    setMobileMenuOpen: (state: boolean) => void
}

export const TimelinePage = memo<TimelinePageProps>((props: TimelinePageProps): JSX.Element => {
    const api = useApi()
    const followService = useFollow()
    const theme = useTheme()

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        ;(async () => {
            if (!reactlocation.hash) {
                // home
                props.setCurrentStreams([
                    ...followService.followingStreams,
                    ...(await api.getUserHomeStreams(followService.followingUsers))
                ])
            } else {
                // non-home
                props.setCurrentStreams(reactlocation.hash.replace('#', '').split(','))
            }
        })()
        scrollParentRef.current?.scroll({ top: 0 })
    }, [reactlocation.hash])

    return (
        <>
            <TimelineHeader
                location={reactlocation}
                setMobileMenuOpen={props.setMobileMenuOpen}
                scrollParentRef={scrollParentRef}
            />
            <Box
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: '100%',
                    padding: { xs: '8px', sm: '8px 16px' },
                    background: theme.palette.background.paper,
                    minHeight: '100%'
                }}
                ref={scrollParentRef}
            >
                <Box>
                    <Draft currentStreams={reactlocation.hash.replace('#', '')} />
                    <Divider />
                </Box>
                {(reactlocation.hash === '' || reactlocation.hash === '#') &&
                followService.followingStreams.length === 0 &&
                followService.followingUsers.length === 0 ? (
                    <Box>まだ誰も、どのストリームもフォローしていません。右上のiボタンを押してみましょう。</Box>
                ) : (
                    <Box sx={{ display: 'flex', flex: 1 }}>
                        <Timeline
                            streams={props.currentStreams}
                            timeline={props.messages}
                            scrollParentRef={scrollParentRef}
                        />
                    </Box>
                )}
            </Box>
        </>
    )
})
TimelinePage.displayName = 'TimelinePage'
