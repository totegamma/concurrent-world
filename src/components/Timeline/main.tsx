import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { AssociationFrame } from '../Association/AssociationFrame'
import type { IuseObjectList } from '../../hooks/useObjectList'
import type { CoreStreamElement } from '@concurrent-world/client'
import type { StreamElementDated } from '../../model'
import { useApi } from '../../context/api'
import { InspectorProvider } from '../../context/Inspector'
import { Loading } from '../ui/Loading'
import { MessageContainer } from '../Message/MessageContainer'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import HeartBrokenIcon from '@mui/icons-material/HeartBroken'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import SyncIcon from '@mui/icons-material/Sync'

export interface TimelineProps {
    streams: string[]
    timeline: IuseObjectList<StreamElementDated>
    scrollParentRef: RefObject<HTMLDivElement>
    perspective?: string
}

const PTR_HEIGHT = 60

const divider = <Divider variant="inset" component="li" sx={{ margin: '8px 4px' }} />

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()

    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    useEffect(() => {
        if (!client.api.host) return
        props.timeline.clear()
        let unmounted = false
        setIsFetching(true)
        setHasMoreData(false)
        client.api
            ?.readStreamRecent(props.streams)
            .then((data: CoreStreamElement[]) => {
                if (unmounted) return
                const current = new Date().getTime()
                const dated = data.map((e) => {
                    return { ...e, LastUpdated: current }
                })
                props.timeline.set(dated)
                setHasMoreData(data.length > 0)
            })
            .finally(() => {
                setIsFetching(false)
            })
        return () => {
            unmounted = true
        }
    }, [props.streams])

    const loadMore = useCallback(() => {
        if (!client.api.host) return
        if (isFetching) return
        if (!props.timeline.current[props.timeline.current.length - 1]?.timestamp) {
            setHasMoreData(false)
            return
        }
        if (!hasMoreData) return
        let unmounted = false
        setIsFetching(true)
        client.api
            ?.readStreamRanged(props.streams, props.timeline.current[props.timeline.current.length - 1].timestamp)
            .then((data: CoreStreamElement[]) => {
                if (unmounted) return
                const idtable = props.timeline.current.map((e) => e.id)
                const newdata = data.filter((e) => !idtable.includes(e.id))
                if (newdata.length > 0) {
                    const current = new Date().getTime()
                    const dated = newdata.map((e) => {
                        return { ...e, LastUpdated: current }
                    })
                    props.timeline.concat(dated)
                } else setHasMoreData(false)
            })
            .finally(() => {
                setIsFetching(false)
            })
        return () => {
            unmounted = true
        }
    }, [client.api, props.streams, props.timeline, hasMoreData, isFetching])

    // WORKAROUND: fill the screen with messages if there are not enough messages to fill the screen
    // to work react-infinite-scroller properly
    useEffect(() => {
        if (!hasMoreData) return
        const timer = setTimeout(() => {
            if (!props.scrollParentRef.current) return
            if (props.scrollParentRef.current.scrollHeight > props.scrollParentRef.current.clientHeight) return
            console.log('filling screen')
            loadMore()
        }, 1000)

        return () => {
            clearTimeout(timer)
        }
    }, [loadMore, props.timeline.current, hasMoreData])

    const [touchPosition, setTouchPosition] = useState<number>(0)
    const [loaderSize, setLoaderSize] = useState<number>(0)
    const [loadable, setLoadable] = useState<boolean>(false)
    const [ptrEnabled, setPtrEnabled] = useState<boolean>(false)

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
            const unmounted = false
            setIsFetching(true)
            setHasMoreData(false)
            setTimeout(() => {
                client.api
                    ?.readStreamRecent(props.streams)
                    .then((data: CoreStreamElement[]) => {
                        if (unmounted) return
                        props.timeline.clear()
                        const current = new Date().getTime()
                        const dated = data.map((e) => {
                            return { ...e, LastUpdated: current }
                        })
                        props.timeline.set(dated)
                        setHasMoreData(data.length > 0)
                    })
                    .finally(() => {
                        setIsFetching(false)
                        setPtrEnabled(false)
                    })
            }, 1000)
        }
    }, [ptrEnabled, setPtrEnabled, props.timeline, props.streams, client.api, isFetching])

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
                        loadMore()
                    }}
                    initialLoad={false}
                    hasMore={hasMoreData}
                    loader={<Loading key={0} message="Loading..." color={theme.palette.text.primary} />}
                    useWindow={false}
                    getScrollParent={() => props.scrollParentRef.current}
                >
                    {props.timeline.current.map((e) => {
                        let element
                        switch (e.type) {
                            case 'message':
                                element = (
                                    <MessageContainer
                                        messageID={e.id}
                                        messageOwner={e.author}
                                        lastUpdated={e.LastUpdated}
                                        after={divider}
                                        timestamp={e.timestamp}
                                    />
                                )
                                break
                            case 'association':
                                element = (
                                    <AssociationFrame
                                        association={e}
                                        lastUpdated={e.LastUpdated}
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
                            <React.Fragment key={e.id}>
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
