import React, {
    type FC,
    useCallback,
    useContext,
    useEffect,
    useRef
} from 'react'
import { Box, useTheme } from '@mui/material'
import { TimelineMessage } from '../components/TimelineMessage'
import { type StreamElement } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { StreamsBar } from '../components/StreamsBar'
import { useLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'
import {
    InfiniteLoader as _InfiniteLoader,
    List as _List,
    CellMeasurer as _CellMeasurer,
    CellMeasurerCache,
    AutoSizer as _AutoSizer,
    type AutoSizerProps,
    type ListProps,
    type InfiniteLoaderProps,
    type CellMeasurerProps
} from 'react-virtualized'

// WORKAROUND: https://github.com/bvaughn/react-virtualized/issues/1739
export const VList = _List as unknown as FC<ListProps> & _List
export const AutoSizer = _AutoSizer as unknown as FC<AutoSizerProps> &
    _AutoSizer
export const InfiniteLoader =
    _InfiniteLoader as unknown as FC<InfiniteLoaderProps> & _InfiniteLoader
export const CellMeasurer = _CellMeasurer as unknown as FC<CellMeasurerProps> &
    _CellMeasurer

export interface TimelineProps {
    messages: IuseObjectList<StreamElement>
    follow: (ccaddress: string) => void
    followList: string[]
    setCurrentStreams: (input: string) => void
    watchstreams: string[]
}

export function Timeline(props: TimelineProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()
    const cache = useRef(new CellMeasurerCache({ fixedWidth: true }))

    const reactlocation = useLocation()

    const reload = useCallback(async () => {
        console.warn('reload!')

        let homequery = ''
        if (!reactlocation.hash) {
            homequery = (
                await Promise.all(
                    props.followList.map(
                        async (ccaddress) =>
                            (
                                await appData.userDict.get(ccaddress)
                            ).homestream
                    )
                )
            )
                .filter((e) => e)
                .join(',')
        }
        const url =
            appData.serverAddress +
            `stream/recent?streams=${
                reactlocation.hash
                    ? reactlocation.hash.replace('#', '')
                    : homequery
            }`

        const requestOptions = {
            method: 'GET',
            headers: {}
        }

        fetch(url, requestOptions)
            .then(async (res) => await res.json())
            .then((data: StreamElement[]) => {
                props.messages.clear()
                data?.sort((a, b) => (a.ID < b.ID ? -1 : 1)).forEach(
                    (e: StreamElement) => {
                        props.messages.push(e)
                    }
                )
            })
    }, [appData.serverAddress, reactlocation.hash])

    useEffect(() => {
        ;(async () => {
            reload()
            let homequery = ''
            if (!reactlocation.hash) {
                homequery = (
                    await Promise.all(
                        props.followList.map(
                            async (ccaddress) =>
                                (
                                    await appData.userDict.get(ccaddress)
                                ).homestream
                        )
                    )
                )
                    .filter((e) => e)
                    .join(',')
            }
            props.setCurrentStreams(
                reactlocation.hash
                    ? reactlocation.hash.replace('#', '')
                    : homequery
            )
        })()
    }, [reactlocation.hash])

    const rowRenderer = ({ index, key, parent, style }: any): JSX.Element => {
        return (
            <CellMeasurer
                cache={cache.current}
                columnIndex={0}
                key={key}
                rowIndex={index}
                parent={parent}
                defaultHeight={105}
            >
                {({ measure }) => (
                    <div style={style}>
                        <TimelineMessage
                            message={props.messages.current[index].Values.id}
                            follow={props.follow}
                            measure={measure}
                            style={style}
                        />
                    </div>
                )}
            </CellMeasurer>
        )
    }

    return (
        <>
            <StreamsBar location={reactlocation} />
            <Box
                sx={{
                    padding: { xs: '8px', sm: '20px' },
                    background: theme.palette.background.paper,
                    flex: '1 1 auto'
                }}
            >
                <Box>
                    <Draft
                        currentStreams={reactlocation.hash.replace('#', '')}
                    />
                </Box>
                <AutoSizer>
                    {({ width, height }) => (
                        <InfiniteLoader
                            isRowLoaded={({ index }) => {
                                return !!props.messages.current[index]
                            }}
                            loadMoreRows={async (): Promise<void> => {}}
                            rowCount={props.messages.current.length}
                        >
                            {({ onRowsRendered, registerChild }) => (
                                <VList
                                    height={height}
                                    rowCount={props.messages.current.length}
                                    rowHeight={cache.current.rowHeight}
                                    rowRenderer={rowRenderer}
                                    onRowsRendered={onRowsRendered}
                                    width={width}
                                    deferredMeasurementCache={cache.current}
                                    ref={(el: any) => {
                                        registerChild(el)
                                    }}
                                />
                            )}
                        </InfiniteLoader>
                    )}
                </AutoSizer>
            </Box>
        </>
    )
}
