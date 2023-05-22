import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { List, Divider, Box, useTheme, Drawer, Typography } from '@mui/material'
import { TimelineMessage } from '../components/TimelineMessage'
import type { Message, StreamElement, StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroller'
import { usePersistent } from '../hooks/usePersistent'
import { TimelineHeader } from '../components/TimelineHeader'
import { useApi } from '../context/api'
import { Schemas } from '../schemas'

export interface TimelineProps {
    messages: IuseObjectList<StreamElementDated>
    follow: (ccaddress: string) => void
    followList: string[]
    setCurrentStreams: (input: string[]) => void
    setMobileMenuOpen: (state: boolean) => void
}

export const Timeline = memo<TimelineProps>(
    (props: TimelineProps): JSX.Element => {
        const api = useApi()
        const theme = useTheme()

        const reactlocation = useLocation()
        const scrollParentRef = useRef<HTMLDivElement>(null)
        const [hasMoreData, setHasMoreData] = useState<boolean>(false)
        const [inspectItem, setInspectItem] = useState<Message<any> | null>(
            null
        )

        const [followStreams] = usePersistent<string[]>('followStreams', [])

        const reload = useCallback(async () => {
            if (!api.host) return
            let homequery = []
            if (!reactlocation.hash) {
                homequery = (
                    await Promise.all(
                        props.followList.map(
                            async (ccaddress) =>
                                (
                                    await api.readCharacter(
                                        ccaddress,
                                        Schemas.profile
                                    )
                                )?.payload.body.homeStream
                        )
                    )
                )
                    .filter((e) => e)
                    .concat(followStreams)
            }
            const query = reactlocation.hash
                ? reactlocation.hash.replace('#', '').split(',')
                : homequery

            api.readStreamRecent(query).then((data: StreamElement[]) => {
                const newdata = data?.sort((a, b) => (a.ID > b.ID ? -1 : 1))
                const current = new Date().getTime()
                const dated = newdata.map((e) => {
                    return { ...e, LastUpdated: current }
                })
                props.messages.set(dated)
                setHasMoreData(true)
            })
        }, [reactlocation.hash])

        const loadMore = useCallback(async () => {
            if (!api.host) return
            const last = props.messages.current
            if (!props.messages.current[props.messages.current.length - 1]?.ID)
                return
            let homequery = ''
            if (!reactlocation.hash) {
                homequery = (
                    await Promise.all(
                        props.followList.map(
                            async (ccaddress) =>
                                (
                                    await api.readCharacter(
                                        ccaddress,
                                        Schemas.profile
                                    )
                                )?.payload.body.homeStream
                        )
                    )
                )
                    .filter((e) => e)
                    .concat(followStreams)
                    .join(',')
            }
            const url = `https://${api.host.fqdn}/stream/range?streams=${
                reactlocation.hash
                    ? reactlocation.hash.replace('#', '')
                    : homequery
            }&until=${
                props.messages.current[props.messages.current.length - 1].ID
            }`

            const requestOptions = {
                method: 'GET',
                headers: {}
            }

            fetch(url, requestOptions)
                .then(async (res) => await res.json())
                .then((data: StreamElement[]) => {
                    if (last !== props.messages.current) {
                        console.log('timeline changed!!!')
                        return
                    }
                    const idtable = props.messages.current.map(
                        (e) => e.Values.id
                    )
                    const newdata = data.filter(
                        (e) => !idtable.includes(e.Values.id)
                    )
                    if (newdata.length > 0) {
                        const current = new Date().getTime()
                        const dated = newdata.map((e) => {
                            return { ...e, LastUpdated: current }
                        })
                        props.messages.concat(dated)
                    } else setHasMoreData(false)
                })
        }, [props.messages.current, reactlocation.hash])

        useEffect(() => {
            ;(async () => {
                reload()
                let homequery: string[] = []
                if (!reactlocation.hash) {
                    homequery = (
                        await Promise.all(
                            props.followList.map(
                                async (ccaddress) =>
                                    (
                                        await api.readCharacter(
                                            ccaddress,
                                            Schemas.profile
                                        )
                                    )?.payload.body.homeStream
                            )
                        )
                    ).filter((e) => e) as string[]
                }
                props.setCurrentStreams(
                    (reactlocation.hash
                        ? reactlocation.hash.replace('#', '').split(',')
                        : homequery
                    ).concat(followStreams)
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
                    followStreams.length === 0 &&
                    props.followList.length === 0 ? (
                        <Box>
                            まだ誰も、どのストリームもフォローしていません。右上のiボタンを押してみましょう。
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flex: 1 }}>
                            <List sx={{ flex: 1, width: '100%' }}>
                                <Divider />
                                <InfiniteScroll
                                    loadMore={() => {
                                        loadMore()
                                    }}
                                    hasMore={hasMoreData}
                                    loader={
                                        <React.Fragment key={0}>
                                            Loading...
                                        </React.Fragment>
                                    }
                                    useWindow={false}
                                    getScrollParent={() =>
                                        scrollParentRef.current
                                    }
                                >
                                    {props.messages.current.map((e) => (
                                        <React.Fragment key={e.Values.id}>
                                            <TimelineMessage
                                                message={e.Values.id}
                                                lastUpdated={e.LastUpdated}
                                                setInspectItem={setInspectItem}
                                                follow={props.follow}
                                            />
                                            <Divider
                                                variant="inset"
                                                component="li"
                                                sx={{ margin: '0 5px' }}
                                            />
                                        </React.Fragment>
                                    ))}
                                </InfiniteScroll>
                            </List>
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
Timeline.displayName = 'Timeline'
