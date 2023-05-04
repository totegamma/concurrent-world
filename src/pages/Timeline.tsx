import React, { useCallback, useContext, useEffect } from 'react'
import { List, Divider, Box, useTheme } from '@mui/material'
import { Tweet } from '../components/Tweet'
import { type RTMMessage, type StreamElement, type User } from '../model'
import { type IuseResourceManager } from '../hooks/useResourceManager'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { StreamsBar } from '../components/StreamsBar'
import { useLocation } from 'react-router-dom'
import { ApplicationContext } from '../App'

export interface TimelineProps {
    messages: IuseObjectList<StreamElement>
    userDict: IuseResourceManager<User>
    messageDict: IuseResourceManager<RTMMessage>
    follow: (ccaddress: string) => void
    followList: string[]
    setCurrentStreams: (input: string) => void
}

export function Timeline(props: TimelineProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme()

    const reactlocation = useLocation()

    const reload = useCallback(async () => {
        console.warn('reload!')

        let homequery = ''
        if (!location.hash) {
            homequery = (
                await Promise.all(
                    props.followList.map(
                        async (ccaddress) =>
                            (
                                await props.userDict.get(ccaddress)
                            ).homestream
                    )
                )
            )
                .filter((e) => e)
                .join(',')
            console.log(homequery)
        }
        const url =
            appData.serverAddress +
            `stream?streams=${
                reactlocation.hash
                    ? reactlocation.hash.replace('#', '')
                    : homequery
            }`
        console.log(url)

        const requestOptions = {
            method: 'GET',
            headers: {}
        }

        fetch(url, requestOptions)
            .then(async (res) => await res.json())
            .then((data: StreamElement[]) => {
                props.messages.clear()
                data.sort((a, b) => (a.ID < b.ID ? -1 : 1)).forEach(
                    (e: StreamElement) => {
                        props.messages.push(e)
                    }
                )
            })
    }, [appData.serverAddress, location.hash])

    useEffect(() => {
        reload()
        props.setCurrentStreams(reactlocation.hash.replace('#', ''))
    }, [reactlocation.hash])

    return (
        <>
            <StreamsBar location={reactlocation} />
            <Box
                sx={{
                    overflowY: 'auto',
                    padding: '20px',
                    background: theme.palette.background.paper,
                    minHeight: '100%'
                }}
            >
                <Box>
                    <Draft
                        currentStreams={reactlocation.hash.replace('#', '')}
                    />
                </Box>
                <Box sx={{ display: 'flex', flex: 1 }}>
                    <List sx={{ flex: 1 }}>
                        {props.messages.current
                            .slice()
                            .reverse()
                            .map((e) => (
                                <React.Fragment key={e.ID}>
                                    <Tweet
                                        message={e.Values.id}
                                        messageDict={props.messageDict}
                                        userDict={props.userDict}
                                        follow={props.follow}
                                    />
                                    <Divider
                                        variant="inset"
                                        component="li"
                                        sx={{ margin: '0 5px' }}
                                    />
                                </React.Fragment>
                            ))}
                    </List>
                </Box>
            </Box>
        </>
    )
}
