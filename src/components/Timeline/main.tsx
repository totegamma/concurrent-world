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
import { usePreference } from '../../context/PreferenceContext'

export interface TimelineProps {
    streams: string[]
    timeline: IuseObjectList<StreamElementDated>
    scrollParentRef: RefObject<HTMLDivElement>
    perspective?: string
}

const divider = <Divider variant="inset" component="li" sx={{ margin: '8px 4px' }} />

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const client = useApi()
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const theme = useTheme()

    const pref = usePreference()

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

    const onScroll = useCallback(() => {
        // console.log(props.scrollParentRef.current?.scrollTop)
        if (!props.scrollParentRef.current) return
        if (props.scrollParentRef.current.scrollTop < -80) {
            if (!client.api.host) return
            if (isFetching) return
            props.timeline.clear()
            const unmounted = false
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
        }
    }, [props.scrollParentRef.current])

    useEffect(() => {
        if (!props.scrollParentRef.current) return
        props.scrollParentRef.current.addEventListener('scroll', onScroll)
        return (): void => props.scrollParentRef.current?.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <InspectorProvider>
            <Box
                height="80px"
                width="100%"
                position="absolute"
                top="-79px" // TEST
                alignItems="center"
                justifyContent="center"
                sx={{
                    color: 'text.secondary',
                    display: {
                        xs: pref.showEditorOnTopMobile ? 'none' : 'flex',
                        sm: pref.showEditorOnTop ? 'none' : 'flex'
                    }
                }}
            >
                Pull to refresh
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
