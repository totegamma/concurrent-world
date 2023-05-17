import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'
import { List, Divider, Box, useTheme, Drawer, Typography } from '@mui/material'
import { TimelineMessage } from '../components/TimelineMessage'
import type { RTMMessage, StreamElement, StreamElementDated } from '../model'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'
import InfiniteScroll from 'react-infinite-scroller'
import { usePersistent } from '../hooks/usePersistent'
import { TimelineHeader } from '../components/TimelineHeader'

export interface TimelineProps {
    messages: IuseObjectList<StreamElementDated>
    follow: (ccaddress: string) => void
    followList: string[]
    setCurrentStreams: (input: string[]) => void
}

export function Timeline(props: TimelineProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()

    const reactlocation = useLocation()
    const scrollParentRef = useRef<HTMLDivElement>(null)
    const [hasMoreData, setHasMoreData] = useState<boolean>(false)
    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)

    const [followStreams] = usePersistent<string[]>('followStreams', [])

    const reload = useCallback(async () => {
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
                .concat(followStreams)
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
                const newdata = data?.sort((a, b) => (a.ID > b.ID ? -1 : 1))
                const current = new Date().getTime()
                const dated = newdata.map((e) => {
                    return { ...e, LastUpdated: current }
                })
                props.messages.set(dated)
                setHasMoreData(true)
            })
    }, [appData.serverAddress, reactlocation.hash])

    const loadMore = useCallback(async () => {
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
                                await appData.userDict.get(ccaddress)
                            ).homestream
                    )
                )
            )
                .filter((e) => e)
                .concat(followStreams)
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
                if (last !== props.messages.current) {
                    console.log('timeline changed!!!')
                    return
                }
                const idtable = props.messages.current.map((e) => e.Values.id)
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
                                    await appData.userDict.get(ccaddress)
                                ).homestream
                        )
                    )
                ).filter((e) => e)
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
            <TimelineHeader location={reactlocation} />
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
                                <React.Fragment key={e.Values.id}>
                                    <TimelineMessage
                                        message={e.Values.id}
                                        lastUpdated={e.LastUpdated}
                                        setInspectItem={setInspectItem}
                                        follow={props.follow}
                                        messageDict={appData.messageDict}
                                        userDict={appData.userDict}
                                        streamDict={appData.streamDict}
                                        userAddress={appData.userAddress}
                                        privatekey={appData.privatekey}
                                        serverAddress={appData.serverAddress}
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
                    <Typography>Signature: {inspectItem?.signature}</Typography>
                    <Typography>Streams: {inspectItem?.streams}</Typography>
                    <Typography>Created: {inspectItem?.cdate}</Typography>
                    <Typography>Payload:</Typography>
                    <pre style={{ overflowX: 'scroll' }}>
                        {JSON.stringify(
                            JSON.parse(inspectItem?.payload ?? 'null'),
                            null,
                            4
                        ).replaceAll('\\n', '\n')}
                    </pre>
                    <Typography>
                        Associations: {inspectItem?.associations}
                    </Typography>
                    <Typography>AssociationsData:</Typography>
                    <pre style={{ overflowX: 'scroll' }}>
                        {JSON.stringify(
                            inspectItem?.associations_data,
                            null,
                            4
                        )}
                    </pre>
                </Box>
            </Drawer>
        </>
    )
}
