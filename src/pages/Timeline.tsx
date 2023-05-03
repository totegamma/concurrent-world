import React, { useContext, useState } from 'react';
import { lighten, Paper, List, Divider, Box, Stack, TextField, Button, useTheme, IconButton, InputBase } from '@mui/material';
import { Tweet } from '../components/Tweet'
import { RTMMessage, StreamElement, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { IuseObjectList } from '../hooks/useObjectList';
import { Sign } from '../util'
import { ApplicationContext } from '../App';
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { Draft } from '../components/Draft';
import { StreamsBar } from '../components/StreamsBar';

export interface TimelineProps {
    messages: IuseObjectList<StreamElement>;
    userDict: IuseResourceManager<User>;
    messageDict: IuseResourceManager<RTMMessage>;
    inspect: (message: RTMMessage | null) => void;
    currentStreams: string;
    setCurrentStreams: (streams: string) => void;
    reload: () => void;
}

export function Timeline(props: TimelineProps) {

    const appData = useContext(ApplicationContext)
    const [draft, setDraft] = useState<string>("");
    const theme = useTheme();

    return (<>
        <StreamsBar 
            currentStreams={props.currentStreams}
            setCurrentStreams={props.setCurrentStreams}
            reload={props.reload}
        />
        <Box sx={{overflowY: "auto", padding: "20px"}}>
            <Box>
                <Draft currentStreams={props.currentStreams} reload={props.reload} />
            </Box>
            <Box sx={{display: 'flex', flex: 1}}>
                <List sx={{flex: 1}}>
                {props.messages.current.map(e =>
                    <React.Fragment key={e.ID}>
                        <Tweet 
                            message={e.Values.id}
                            messageDict={props.messageDict}
                            userDict={props.userDict}
                            inspect={props.inspect}
                        />
                        <Divider variant="inset" component="li" sx={{margin: '0 5px'}} />
                    </React.Fragment>
                )}
                </List>
            </Box>
        </Box>
    </>);
}
