import React, { useContext, useEffect } from 'react';
import { Paper, List, Divider } from '@mui/material';
import { Tweet } from './Tweet'
import { RTMMessage, StreamElement, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { IuseObjectList } from '../hooks/useObjectList';

export interface TimelineProps {
    currentStreams: string
    messages: IuseObjectList<StreamElement>;
    userDict: IuseResourceManager<User>;
    messageDict: IuseResourceManager<RTMMessage>;
    inspect: (message: RTMMessage | null) => void;
}

export function Timeline(props: TimelineProps) {

    return (<>
        <Paper sx={{display: 'flex', flex: 1}}>
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
        </Paper>
    </>);
}
