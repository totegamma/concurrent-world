import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { AssociationFrame } from '../Association/AssociationFrame'
import { useApi } from '../../context/api'
import { InspectorProvider } from '../../context/Inspector'
import { Loading } from '../ui/Loading'
import { MessageContainer } from '../Message/MessageContainer'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import HeartBrokenIcon from '@mui/icons-material/HeartBroken'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SyncIcon from '@mui/icons-material/Sync'
import { type Timeline as CoreTimeline } from '@concurrent-world/client'
import { useRefWithForceUpdate } from '../../hooks/useRefWithForceUpdate'

export interface TimelineProps {
    streams: string[]
    scrollParentRef: RefObject<HTMLDivElement>
    perspective?: string
}

const PTR_HEIGHT = 60

const divider = <Divider variant="inset" component="li" sx={{ margin: '8px 4px' }} />

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()

    const [timeline, timelineChanged] = useRefWithForceUpdate<CoreTimeline | null>(null)

    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    const [touchPosition, setTouchPosition] = useState<number>(0)
    const [loaderSize, setLoaderSize] = useState<number>(0)
    const [loadable, setLoadable] = useState<boolean>(false)
    const [ptrEnabled, setPtrEnabled] = useState<boolean>(false)

    useEffect(() => {
        if (props.streams.length === 0) return
        console.log('Timeline: streams changed', props.streams)
        client.newTimeline().then((t) => {
            timeline.current = t
            timeline.current.listen(props.streams).then((hasMore) => {
                setHasMoreData(hasMore)
            })
            t.onUpdate = () => {
                timelineChanged()
            }
        })
    }, [props.streams])

    const onTouchStart = useCallback((raw: Event) => {
        const e = raw as TouchEvent
        setTouchPosition(e.touches[0].clientY)
        setLoadable(props.scrollParentRef.current?.scrollTop === 0)
    }, [])

    const onTouchMove = useCallback(
        (raw: Event) => {
            if (!loadable) return
            const e = raw as TouchEvent
            if (!props.scrollParentRef.current) return
            const delta = e.touches[0].clientY - touchPosition
            setLoaderSize(Math.min(Math.max(delta, 0), PTR_HEIGHT))
            if (delta >= PTR_HEIGHT) setPtrEnabled(true)
        },
        [props.scrollParentRef.current, touchPosition]
    )

    const onTouchEnd = useCallback(() => {
        setLoaderSize(0)
        if (ptrEnabled) {
            if (isFetching) {
                setPtrEnabled(false)
                return
            }
            setIsFetching(true)
            setHasMoreData(false)
            setTimeout(() => {
                // TODO: reload
            }, 1000)
        }
    }, [ptrEnabled, setPtrEnabled, props.streams, client.api, isFetching])

    useEffect(() => {
        if (!props.scrollParentRef.current) return
        props.scrollParentRef.current.addEventListener('touchstart', onTouchStart)
        props.scrollParentRef.current.addEventListener('touchmove', onTouchMove)
        props.scrollParentRef.current.addEventListener('touchend', onTouchEnd)
        return () => {
            props.scrollParentRef.current?.removeEventListener('touchstart', onTouchStart)
            props.scrollParentRef.current?.removeEventListener('touchmove', onTouchMove)
            props.scrollParentRef.current?.removeEventListener('touchend', onTouchEnd)
        }
    }, [props.scrollParentRef.current, onTouchStart, onTouchMove, onTouchEnd])

    return (
        <InspectorProvider>
            <Box
                sx={{
                    height: `${ptrEnabled ? PTR_HEIGHT : loaderSize}px`,
                    width: '100%',
                    position: 'relative',
                    color: 'text.secondary',
                    display: 'flex',
                    transition: 'height 0.2s ease-in-out',
                    overflow: 'hidden'
                }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height={`${PTR_HEIGHT}px`}
                    position="absolute"
                    width="100%"
                    bottom="0"
                    left="0"
                >
                    {isFetching ? (
                        <SyncIcon
                            sx={{
                                animation: 'spin 1s linear infinite',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(-360deg)' }
                                }
                            }}
                        />
                    ) : (
                        <ArrowUpwardIcon
                            sx={{
                                transform: `rotate(${ptrEnabled ? 0 : 180}deg)`,
                                transition: 'transform 0.2s ease-in-out'
                            }}
                        />
                    )}
                </Box>
            </Box>
            <List sx={{ flex: 1, width: '100%' }}>
                <InfiniteScroll
                    loadMore={() => {
                        console.log('readMore!!!')
                        timeline.current?.readMore().then((hasMore) => {
                            setHasMoreData(hasMore)
                        })
                    }}
                    initialLoad={false}
                    hasMore={hasMoreData}
                    loader={<Loading key={0} message="Loading..." color={theme.palette.text.primary} />}
                    useWindow={false}
                    getScrollParent={() => props.scrollParentRef.current}
                >
                    {timeline.current?.body.map((e) => {
                        let element
                        switch (e.type) {
                            case 'message':
                                element = (
                                    <MessageContainer
                                        messageID={e.objectID}
                                        messageOwner={e.owner}
                                        lastUpdated={e.lastUpdate?.getTime() ?? 0}
                                        after={divider}
                                        timestamp={e.cdate}
                                    />
                                )
                                break
                            case 'association':
                                element = (
                                    <AssociationFrame
                                        association={e}
                                        lastUpdated={e.lastUpdate?.getTime() ?? 0}
                                        after={divider}
                                        perspective={props.perspective}
                                    />
                                )
                                break
                            default:
                                element = <Typography>Unknown message type: {e.type}</Typography>
                                break
                        }

                        return (
                            <React.Fragment key={e.objectID}>
                                <ErrorBoundary FallbackComponent={renderError}>{element}</ErrorBoundary>
                            </React.Fragment>
                        )
                    })}
                </InfiniteScroll>
            </List>
        </InspectorProvider>
    )
})

const renderError = ({ error }: FallbackProps): JSX.Element => {
    return (
        <ListItem>
            <ListItemIcon>
                <HeartBrokenIcon />
            </ListItemIcon>
            <ListItemText primary="この要素の描画中に問題が発生しました" secondary={error?.message} />
        </ListItem>
    )
}

Timeline.displayName = 'Timeline'
