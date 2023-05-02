import { useEffect, useState, createContext } from 'react';
import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import { Sign, Keygen } from './util'

import { usePersistent } from './hooks/usePersistent';
import { Timeline } from './components/Timeline';

import { useResourceManager } from './hooks/useResourceManager';
import type { RTMMessage, StreamElement, User } from './model';
import { Schemas } from './schemas';
import { useObjectList } from './hooks/useObjectList';

export const ApplicationContext = createContext<appData>({
    serverAddress: '',
    publickey: '',
    privatekey: '',
    userAddress: ''
});

export interface appData {
    serverAddress: string
    publickey: string
    privatekey: string
    userAddress: string
}

function App() {

    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)
    const [server, setServer] = usePersistent<string>("ServerAddress", "");
    const [pubkey, setPubKey] = usePersistent<string>("PublicKey", "");
    const [prvkey, setPrvKey] = usePersistent<string>("PrivateKey", "");
    const [address, setAddress] = usePersistent<string>("Address", "");

    const [postStreams, setPostStreams] = usePersistent<string>("postStream", "common");
    let [currentStreams, setCurrentStreams] = usePersistent<string>("currentStream", "common,0");

    const [streams, setStreams] = useState<string[]>([]);

    const [username, setUsername] = usePersistent<string>("Username", "anonymous");
    const [avatar, setAvatar] = usePersistent<string>("AvatarURL", "");

    const [draft, setDraft] = useState<string>("");

    const userDict = useResourceManager<User>(async (key: string) => {
        const res = await fetch(server + 'characters?author=' + encodeURIComponent(key) + '&schema=' + encodeURIComponent(Schemas.profile), {
            method: 'GET',
            headers: {}
        });
        const data = await res.json();
        const payload = JSON.parse(data.characters[0].payload)
        return {
            pubkey: data.characters[0].author,
            username: payload.username,
            avatar: payload.avatar,
            description: payload.description
        };
    });

    const messageDict = useResourceManager<RTMMessage>(async (key: string) => {
        const res = await fetch(server + `messages/${key}`, {
            method: 'GET',
            headers: {}
        });
        const data = await res.json()
        console.log(data.message)
        return data.message
    });

    const messages = useObjectList<StreamElement>();

    const reload = () => {
        let url = server + `stream?streams=${currentStreams}`

        const requestOptions = {
            method: 'GET',
            headers: {}
        };

        fetch(url, requestOptions)
        .then(res => res.json())
        .then((data: StreamElement[]) => {
            console.log(data);
            messages.clear();
            data.sort((a, b) => a.ID > b.ID ? -1 : 1).forEach((e: StreamElement) => messages.push(e));
        });
    }

    useEffect(() => {
        reload()
    }, [])

    useEffect(() => {
        if (pubkey == "" && prvkey == "") regenerateKeys();
        fetch(server + 'stream/list').then((data) => {
            data.json().then((json) => {
                setStreams(json)
            });
        });
    }, []);


    const regenerateKeys = () => {
        const key = Keygen()
        setPubKey(key.publickey)
        setPrvKey(key.privatekey)
        setAddress(key.ccaddress)
    }

    const post = () => {
        const payload_obj = {
            'body': draft
        }
        const payload = JSON.stringify(payload_obj)
        const signature = Sign(prvkey, payload)

        const requestOptions = {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                author: address,
                payload: payload,
                signature: signature,
                streams: postStreams
            })
        };

        fetch(server + 'messages', requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            setDraft("");
            reload();
        });
    }

    const updateProfile = () => {
        const payload_obj = {
            'username': username,
            'avatar': avatar,
            'description': ''
        }

        const payload = JSON.stringify(payload_obj);
        const signature = Sign(prvkey, payload)

        const requestOptions = {
            method: 'PUT',
            headers: {},
            body: JSON.stringify({
                'author': address,
                'schema': Schemas.profile,
                'payload': payload,
                signature: signature,
            })
        };

        fetch(server + 'characters', requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            reload();
        });

    }

    return (
    <ApplicationContext.Provider value={{serverAddress: server, publickey: pubkey, privatekey: prvkey, userAddress: address}}>
    <Box sx={{display: "flex", padding: "10px", gap: "10px", backgroundColor: "#f2f2f2", width: "100vw", height: "100vh", justifyContent: "center"}}>
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>

            <Paper sx={{width: "300px", padding: "15px"}}>
                <Typography variant="h5" gutterBottom>Concurrent</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton>
                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {streams.map((value) => {
                        const labelId = `checkbox-list-secondary-label-${value}`;
                        return (
                        <ListItem
                            key={value}
                            secondaryAction={
                                <Button onClick={() => {
                                    setCurrentStreams(currentStreams = `${value},0`);
                                    setPostStreams(value);
                                    reload()
                                }}>switch</Button>
                            }
                            disablePadding
                        >
                            <ListItemButton>
                                <ListItemText id={labelId} primary={value} />
                            </ListItemButton>
                        </ListItem>
                        );
                    })}
                    </List>
                </Box>
            </Paper>

            <Paper sx={{width: "300px", padding: "15px"}}>
                <Typography variant="h5" gutterBottom>Profile</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                    <TextField label="username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <TextField label="avatarURL" variant="outlined" value={avatar} onChange={(e) => setAvatar(e.target.value)}/>
                    <Button variant="contained" onClick={_ => updateProfile()}>Update</Button>
                </Box>
            </Paper>

            <Paper sx={{width: "300px", padding: "15px"}}>
                <Typography variant="h5" gutterBottom>Settings</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                    <TextField label="server" variant="outlined" value={server} onChange={(e) => setServer(e.target.value)}/>
                    <TextField label="privateKey" variant="outlined" value={prvkey} onChange={(e) => setPrvKey(e.target.value)}/>
                    <TextField label="address" variant="outlined" value={address} onChange={(e) => setAddress(e.target.value)}/>
                    <TextField label="publicKey" variant="outlined" value={pubkey} onChange={(e) => setPubKey(e.target.value)}/>
                    <Button variant="contained" onClick={_ => regenerateKeys()}>Generate Key</Button>
                </Box>
            </Paper>
        </Box>
        <Paper sx={{width: "800px", padding: "15px", display: "flex", flexFlow: "column"}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "5px"}}>
            <Typography variant="h5" gutterBottom>Timeline</Typography>
            <Box>
                <TextField label="watchStreams" variant="outlined" value={currentStreams} onChange={(e) => setCurrentStreams(e.target.value)}/>
                <Button variant="contained" onClick={_ => reload()}>GO</Button>
            </Box>
            </Box>
            <Divider/>
            <Box>
                <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                    <TextField label="postStreams" variant="outlined" value={postStreams} onChange={(e) => setPostStreams(e.target.value)}/>
                    <TextField multiline rows={6} label="message" variant="outlined" value={draft} onChange={(e) => setDraft(e.target.value)}/>
                    <Button variant="contained" onClick={_ => post()}>post</Button>
                </Box>
            </Box>
            <Divider/>
            <Box sx={{overflowY: "scroll"}}>
                <Timeline messages={messages} currentStreams={currentStreams} messageDict={messageDict} userDict={userDict} inspect={setInspectItem}/>
            </Box>
        </Paper>

        <Drawer
            anchor={'right'}
            open={inspectItem != null}
            onClose={() => setInspectItem(null)}
        >
            <Box sx={{width: "40vw", fontSize: "13px"}}>
                <pre>
                    {JSON.stringify(inspectItem, null, 4)}
                </pre>
            </Box>
        </Drawer>
    </Box>
    </ApplicationContext.Provider>
    )
}

export default App
