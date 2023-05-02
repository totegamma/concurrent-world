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
                streams: props.currentStreams
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
        <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
            theme.palette.primary.main,
            padding: "5px",
            borderRadius: "20px 20px 0 0"
        }}>
            <Paper
                component="form"
                elevation={0}
                sx={{
                    m: '3px 30px',
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: '32px',
                    borderRadius: '16px',
                    background: lighten(theme.palette.primary.main, 0.3)
                }}
            >
                <IconButton sx={{ p: '10px' }}>
                    <ExploreIcon sx={{ color: "white" }} />
                </IconButton>
                <InputBase
                    sx={{ ml: 1, flex: 1, color: '#fff' }}
                    value={props.currentStreams}
                    onChange={(e) => props.setCurrentStreams(e.target.value)}
                />
                <IconButton sx={{ p: '10px' }} onClick={_ => props.reload()}>
                    <SearchIcon sx={{ color: "white" }} />
                </IconButton>
            </Paper>
        </Box>
        <Box sx={{overflowY: "auto", padding: "20px"}}>
            <Box>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px", mb: '10px'}}>
                    <Stack sx={{
                        position: 'relative'
                    }}>
                        <TextField multiline rows={6} label="message" variant="outlined" value={draft} onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e: any) => {
                                if ((draft.length == 0) || (draft.trim().length == 0)) return
                                if (e.key == 'Enter' && e.ctrlKey == true) {
                                    post()
                                }
                            }}
                        />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 10,
                                right: 10
                            }}>
                            <Button
                                color="primary"
                                variant="contained"
                                disabled={(draft.length == 0) || (draft.trim().length == 0)}
                                onClick={_ => post()}
                                endIcon={<SendIcon/>}
                            >
                                Send
                            </Button>
                        </Box>
                    </Stack>
                </Box>
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
