import { memo, useEffect, useRef, useState } from 'react'
import { Box, useTheme, Drawer, Typography } from '@mui/material'
import type { Message, StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { Schemas } from '../schemas'
import { useFollow } from '../context/FollowContext'
import { Timeline } from '../components/Timeline/main'

export interface TimelinePageProps {
    messages: IuseObjectList<StreamElementDated>
    currentStreams: string[]
    setCurrentStreams: (input: string[]) => void
    setMobileMenuOpen: (state: boolean) => void
}

export const TimelinePage = memo<TimelinePageProps>(
    (props: TimelinePageProps): JSX.Element => {
        const api = useApi()
        const followService = useFollow()
        const theme = useTheme()

        const reactlocation = useLocation()
        const scrollParentRef = useRef<HTMLDivElement>(null)
        const [inspectItem, setInspectItem] = useState<Message<any> | null>(
            null
        )

        useEffect(() => {
            ;(async () => {
                let homequery: string[] = [...followService.followingStreams]
                console.log('followingUsers', followService.followingUsers)
                if (!reactlocation.hash) {
                    homequery = (
                        await Promise.all(
                            followService.followingUsers.map(
                                async (ccaddress: string) =>
                                    (
                                        await api.readCharacter(
                                            ccaddress,
                                            Schemas.profile
                                        )
                                    )?.payload.body.homeStream
                            )
                        )
                    ).filter((e: any) => e) as string[]
                }
                props.setCurrentStreams(
                    reactlocation.hash
                        ? reactlocation.hash.replace('#', '').split(',')
                        : homequery
                )
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
                        <Draft
                            currentStreams={reactlocation.hash.replace('#', '')}
                        />
                    </Box>
                    {(reactlocation.hash === '' ||
                        reactlocation.hash === '#') &&
                    followService.followingStreams.length === 0 &&
                    followService.followingUsers.length === 0 ? (
                        <Box>
                            まだ誰も、どのストリームもフォローしていません。右上のiボタンを押してみましょう。
                        </Box>
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
                <Drawer
                    anchor={'right'}
                    open={inspectItem != null}
                    onClose={() => {
                        setInspectItem(null)
                    }}
                    PaperProps={{
                        sx: {
                            width: '40vw',
                            borderRadius: '20px 0 0 20px',
                            overflow: 'hidden',
                            padding: '20px'
                        }
                    }}
                >
                    <Box
                        sx={{
                            margin: 0,
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            fontSize: '13px'
                        }}
                    >
                        <Typography>ID: {inspectItem?.id}</Typography>
                        <Typography>Author: {inspectItem?.author}</Typography>
                        <Typography>Schema: {inspectItem?.schema}</Typography>
                        <Typography>
                            Signature: {inspectItem?.signature}
                        </Typography>
                        <Typography>Streams: {inspectItem?.streams}</Typography>
                        <Typography>Created: {inspectItem?.cdate}</Typography>
                        <Typography>Payload:</Typography>
                        <pre style={{ overflowX: 'scroll' }}>
                            {JSON.stringify(
                                inspectItem?.payload ?? 'null',
                                null,
                                4
                            )?.replaceAll('\\n', '\n')}
                        </pre>
                        <Typography>Associations:</Typography>
                        <pre style={{ overflowX: 'scroll' }}>
                            {JSON.stringify(inspectItem?.associations, null, 4)}
                        </pre>
                    </Box>
                </Drawer>
            </>
        )
    }
)
TimelinePage.displayName = 'TimelinePage'
