import { Divider, List, Typography, useTheme } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { AssociationFrame } from './AssociationFrame'
import type { IuseObjectList } from '../../hooks/useObjectList'
import type { StreamElement, StreamElementDated } from '../../model'
import { useApi } from '../../context/api'
import { InspectorProvider } from '../../context/Inspector'
import { Loading } from '../Loading'
import { MessageContainer } from './MessageContainer'
import { MessageDetailProvider } from '../../context/MessageDetail'

export interface TimelineProps {
    streams: string[]
    timeline: IuseObjectList<StreamElementDated>
    scrollParentRef: RefObject<HTMLDivElement>
    perspective?: string
}

const divider = <Divider variant="inset" component="li" sx={{ margin: '8px 4px' }} />

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const api = useApi()
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const theme = useTheme()

    useEffect(() => {
        if (!api.host) return
        props.timeline.clear()
        let unmounted = false
        setIsFetching(true)
        setHasMoreData(true)
        api?.readStreamRecent(props.streams).then((data: StreamElement[]) => {
            if (unmounted) return
            const current = new Date().getTime()
            const dated = data.map((e) => {
                return { ...e, LastUpdated: current }
            })
            props.timeline.set(dated)
            setHasMoreData(true)
        })
        return () => {
            unmounted = true
        }
    }, [props.streams])

    const loadMore = useCallback(() => {
        if (!api.host) return
        if (isFetching) return
        if (!props.timeline.current[props.timeline.current.length - 1]?.timestamp) return
        if (!hasMoreData) return
        let unmounted = false
        setIsFetching(true)
        api?.readStreamRanged(props.streams, props.timeline.current[props.timeline.current.length - 1].timestamp).then(
            (data: StreamElement[]) => {
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
            }
        )
        return () => {
            unmounted = true
        }
    }, [api, props.streams, props.timeline, hasMoreData, isFetching])

    useEffect(() => {
        setIsFetching(false)
    }, [props.timeline.current])

    return (
        <InspectorProvider>
            <MessageDetailProvider>
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

                            return <React.Fragment key={e.id}>{element}</React.Fragment>
                        })}
                    </InfiniteScroll>
                </List>
            </MessageDetailProvider>
        </InspectorProvider>
    )
})

Timeline.displayName = 'Timeline'
