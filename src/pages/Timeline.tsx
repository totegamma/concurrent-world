import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'
import { List, Divider, Box, useTheme } from '@mui/material'
import { TimelineMessage } from '../components/TimelineMessage'
import { type StreamElement } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { StreamsBar } from '../components/StreamsBar'
import { useLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'
import InfiniteScroll from 'react-infinite-scroller'

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

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)

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
                const newdata = data?.sort((a, b) => (a.ID > b.ID ? -1 : 1))
                props.messages.concat(newdata)
            })
        setHasMoreData(true)
    }, [appData.serverAddress, reactlocation.hash])

    const loadMore = useCallback(async () => {
        console.log('load more!!!')
        if (!props.messages.current[props.messages.current.length - 1]?.ID)
            return
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
            `stream/range?streams=${
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
                const idtable = props.messages.current.map((e) => e.ID)
                const newdata = data.filter((e) => !idtable.includes(e.ID))
                if (newdata.length > 0) props.messages.concat(newdata)
                else setHasMoreData(false)
            })
    }, [props.messages.current, reactlocation.hash])

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
        scrollParentRef.current?.scroll({ top: 0 })
    }, [reactlocation.hash])

    return (
        <>
            <StreamsBar location={reactlocation} />
            <Box
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: '100%',
                    padding: { xs: '8px', sm: '20px' },
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
                <Box sx={{ display: 'flex', flex: 1 }}>
                    <List sx={{ flex: 1, width: '100%' }}>
                        <InfiniteScroll
                            loadMore={() => {
                                loadMore()
                            }}
                            hasMore={hasMoreData}
                            loader={<>Loading...</>}
                            useWindow={false}
                            getScrollParent={() => scrollParentRef.current}
                        >
                            {props.messages.current.map((e) => (
                                <React.Fragment key={e.ID}>
                                    <TimelineMessage
                                        message={e.Values.id}
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
            </Box>
        </>
    )
}
