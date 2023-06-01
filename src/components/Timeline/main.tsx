import { Divider, List, Typography } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { MessageFrame } from './MessageFrame'
import { AssociationFrame } from './AssociationFrame'
import type { IuseObjectList } from '../../hooks/useObjectList'
import type { StreamElement, StreamElementDated } from '../../model'
import { useApi } from '../../context/api'
import { InspectorProvider } from '../../context/Inspector'

export interface TimelineProps {
    streams: string[]
    timeline: IuseObjectList<StreamElementDated>
    scrollParentRef: RefObject<HTMLDivElement>
}

export const Timeline = memo<TimelineProps>((props: TimelineProps): JSX.Element => {
    const api = useApi()
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)

    useEffect(() => {
        console.log('load recent!', props.streams)
        let unmounted = false
        props.timeline.clear()
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
        console.log('load more!')
        let unmounted = false
        if (!props.timeline.current[props.timeline.current.length - 1]?.timestamp) {
            return
        }

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
    }, [api, props.streams, props.timeline])

    return (
        <InspectorProvider>
            <List sx={{ flex: 1, width: '100%' }}>
                <InfiniteScroll
                    loadMore={() => {
                        loadMore()
                    }}
                    hasMore={hasMoreData}
                    loader={<React.Fragment key={0}>Loading...</React.Fragment>}
                    useWindow={false}
                    getScrollParent={() => props.scrollParentRef.current}
                >
                    {props.timeline.current.map((e) => (
                        <React.Fragment key={e.id}>
                            {e.type === 'message' && <MessageFrame message={e} lastUpdated={e.LastUpdated} />}
                            {e.type === 'association' && (
                                <AssociationFrame association={e} lastUpdated={e.LastUpdated} />
                            )}
                            {e.type !== 'message' && e.type !== 'association' && (
                                <Typography>Unknown message type: {e.type}</Typography>
                            )}
                            <Divider variant="inset" component="li" sx={{ margin: '0 5px' }} />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>
            </List>
        </InspectorProvider>
    )
})

Timeline.displayName = 'Timeline'
