import React from 'react'
import { List, Divider, Box, useTheme } from '@mui/material'
import { Tweet } from '../components/Tweet'
import { type RTMMessage, type StreamElement, type User } from '../model'
import { type IuseResourceManager } from '../hooks/useResourceManager'
import { type IuseObjectList } from '../hooks/useObjectList'
import { Draft } from '../components/Draft'
import { StreamsBar } from '../components/StreamsBar'

export interface TimelineProps {
    messages: IuseObjectList<StreamElement>
    userDict: IuseResourceManager<User>
    messageDict: IuseResourceManager<RTMMessage>
    currentStreams: string
    setCurrentStreams: (streams: string) => void
    reload: () => void
}

export function Timeline(props: TimelineProps): JSX.Element {
    const theme = useTheme()

    return (
        <>
            <StreamsBar
                currentStreams={props.currentStreams}
                setCurrentStreams={props.setCurrentStreams}
                reload={props.reload}
            />
            <Box
                sx={{
                    overflowY: 'auto',
                    padding: '20px',
                    background: theme.palette.background.paper,
                    minHeight: '100%'
                }}
            >
                <Box>
                    <Draft currentStreams={props.currentStreams} />
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
