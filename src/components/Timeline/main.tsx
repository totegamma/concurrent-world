import { Divider, List } from '@mui/material'
import React, { type RefObject, memo, useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { MessageFrame } from './MessageFrame'
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
        api?.readStreamRecent(props.streams).then((data: StreamElement[]) => {
            const current = new Date().getTime()
            const dated = data.map((e) => {
                return { ...e, LastUpdated: current }
            })
            props.timeline.set(dated)
            setHasMoreData(true)
        })
    }, [props.streams])

    const loadMore = useCallback(async () => {
        if (!api.host) return
        console.log('load more!')
        const last = props.timeline.current
        if (!props.timeline.current[props.timeline.current.length - 1]?.timestamp) {
            return
        }

        api?.readStreamRanged(props.streams, props.timeline.current[props.timeline.current.length - 1].timestamp).then(
            (data: StreamElement[]) => {
                if (last !== props.timeline.current) {
                    return
                }
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
    }, [api, props.streams, props.timeline])

    return (
        <InspectorProvider>
            <List sx={{ flex: 1, width: '100%' }}>
                <Divider />
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
                            <MessageFrame message={e} lastUpdated={e.LastUpdated} />
                            <Divider variant="inset" component="li" sx={{ margin: '0 5px' }} />
                        </React.Fragment>
                    ))}
                </InfiniteScroll>
            </List>
        </InspectorProvider>
    )
})

Timeline.displayName = 'Timeline'
