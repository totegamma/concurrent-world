import React from 'react';
import { Paper, List, Divider } from '@mui/material';
import { Tweet } from './Tweet'
import { IuseObjectList } from '../hooks/useObjectList';
import { RTMMessage, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';

export interface TimelineProps {
    messages: IuseObjectList<RTMMessage>;
    userDict: IuseResourceManager<User>;
    clickAvatar: (userid: string) => void;
}

export function Timeline(props: TimelineProps) {
    return (<>
        <Paper sx={{display: 'flex', flex: 1}}>
            <List sx={{flex: 1}}>
            {props.messages.current.map(e =>
                <React.Fragment key={e.id}>
                    <Tweet message={e}
                        userDict={props.userDict}
                        clickAvatar={() => {
                            props.clickAvatar(e.author)
                        }}/>
                    <Divider variant="inset" component="li" sx={{margin: '0 5px'}} />
                </React.Fragment>
            )}
            </List>
        </Paper>
    </>);
}
