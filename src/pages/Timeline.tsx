import React, { useContext, useState } from 'react';
import { Paper, List, Divider, Box, Stack, TextField, Button, Typography } from '@mui/material';
import { Tweet } from '../components/Tweet'
import { RTMMessage, StreamElement, User } from '../model';
import { IuseResourceManager } from '../hooks/useResourceManager';
import { IuseObjectList } from '../hooks/useObjectList';
import { Sign } from '../util'
import { ApplicationContext } from '../App';

export interface TimelineProps {
    messages: IuseObjectList<StreamElement>;
    userDict: IuseResourceManager<User>;
    messageDict: IuseResourceManager<RTMMessage>;
    inspect: (message: RTMMessage | null) => void;
    postStreams: string;
    setPostStreams: (streams: string) => void;
    currentStreams: string;
    setCurrentStreams: (streams: string) => void;
    reload: () => void;
}

export function Timeline(props: TimelineProps) {

    const appData = useContext(ApplicationContext)
    const [draft, setDraft] = useState<string>("");

    const post = () => {
        const payload_obj = {
            'body': draft
        }
        const payload = JSON.stringify(payload_obj)
        const signature = Sign(appData.privatekey, payload)

        const requestOptions = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                author: appData.userAddress,
                payload: payload,
                signature: signature,
                streams: props.postStreams
            })
        };

        fetch(appData.serverAddress+ 'messages', requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setDraft("");
            props.reload();
        });
    }

    return (<>
        <Box>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "5px"}}>
                <Typography variant="h5" gutterBottom>Timeline</Typography>
                <Box>
                    <TextField label="watchStreams" variant="outlined" value={props.currentStreams} onChange={(e) => props.setCurrentStreams(e.target.value)}/>
                    <Button variant="contained" onClick={_ => props.reload()}>GO</Button>
                </Box>
            </Box>
            <Divider/>

            <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                <TextField label="postStreams" variant="outlined" value={props.postStreams} onChange={(e) => props.setPostStreams(e.target.value)}/>
                <Stack sx={{
                    position: 'relative'
                }}>
                    <TextField multiline rows={6} label="message" variant="outlined" value={draft} onChange={(e) => setDraft(e.target.value)}/>
                        <Box sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10
                        }}>
                        <Button disabled={(draft.length == 0) || (draft.trim().length == 0)} variant="contained" onClick={_ => post()}>post</Button>
                    </Box>
                </Stack>
            </Box>
        </Box>
        <Divider/>
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
