import { useEffect, useState, createContext } from 'react';
import { Box, Button, createTheme, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, Paper, TextField, ThemeProvider, Typography } from '@mui/material';
import { Sign, Keygen } from './util'

import { Link } from 'react-router-dom'

import { usePersistent } from './hooks/usePersistent';
import { darken } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Associations, Explorer, Notification, Profile, Settings, Timeline } from './pages';

import { useResourceManager } from './hooks/useResourceManager';
import type { RTMMessage, StreamElement, User } from './model';
import { Schemas } from './schemas';
import { useObjectList } from './hooks/useObjectList';
import { Theme } from '@emotion/react';
import { Themes } from './themes';

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


    const [themeName, setThemeName] = usePersistent<string>("Theme", Object.keys(Themes)[0]);
    const [theme, setTheme] = useState<Theme>(createTheme((Themes as any)[themeName]))

    useEffect(() => {
        setTheme(createTheme((Themes as any)[themeName]))
    }, [themeName]);


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




    return (
    <ThemeProvider theme={theme}>
    <ApplicationContext.Provider value={{serverAddress: server, publickey: pubkey, privatekey: prvkey, userAddress: address}}>
    <BrowserRouter>
    <Box sx={{display: "flex", padding: "10px", gap: "10px", background: `linear-gradient(${theme.palette.background.default}, ${darken(theme.palette.background.default, 0.1)})`, width: "100vw", height: "100vh", justifyContent: "center"}}>
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px"}}>

            <Box sx={{width: "300px", padding: "15px", color: "#fff"}}>
                <Typography variant="h5" gutterBottom>Concurrent</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/">
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/notification">
                                <ListItemText primary="Notification" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/associations">
                                <ListItemText primary="Associations" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/explorer">
                                <ListItemText primary="Explorer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/profile">
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding >
                            <ListItemButton component={Link} to="/settings">
                                <ListItemText primary="Settings" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", gap: "5px"}}>
                    <List dense sx={{ width: '100%', maxWidth: 360 }}>
                    {streams.map((value) => {
                        const labelId = `checkbox-list-secondary-label-${value}`;
                        return (
                        <ListItem
                            key={value}
                            disablePadding
                        >
                            <ListItemButton  onClick={() => {
                                    setCurrentStreams(currentStreams = `${value},0`);
                                    setPostStreams(value);
                                    reload()
                                }}>
                                <ListItemText id={labelId} primary={`%${value}`} />
                            </ListItemButton>
                        </ListItem>
                        );
                    })}
                    </List>
                </Box>
            </Box>


            <Box sx={{width: "300px", padding: "15px"}}>
                <Typography variant="h5" gutterBottom>Settings</Typography>
                <Divider/>
                <Box sx={{display: "flex", flexDirection: "column", padding: "15px", gap: "5px"}}>
                    <TextField label="server" variant="outlined" value={server} onChange={(e) => setServer(e.target.value)}/>
                    <TextField label="privateKey" variant="outlined" value={prvkey} onChange={(e) => setPrvKey(e.target.value)}/>
                    <TextField label="address" variant="outlined" value={address} onChange={(e) => setAddress(e.target.value)}/>
                    <TextField label="publicKey" variant="outlined" value={pubkey} onChange={(e) => setPubKey(e.target.value)}/>
                    <Button variant="contained" onClick={_ => regenerateKeys()}>Generate Key</Button>
                </Box>
            </Box>
        </Box>
        <Paper sx={{flexGrow: "1", maxWidth: "70vw", margin: "10px", padding: "20px", display: "flex", flexFlow: "column", borderRadius: "20px"}}>
            <Box sx={{overflowY: "scroll"}}>
                <Routes>
                    <Route index element={ 
                        <Timeline
                            messages={messages}
                            messageDict={messageDict}
                            userDict={userDict}
                            currentStreams={currentStreams}
                            setCurrentStreams={setCurrentStreams}
                            postStreams={postStreams}
                            setPostStreams={setPostStreams}
                            reload={reload}
                            inspect={setInspectItem}
                        />
                    } />
                    <Route path="/associations" element={<Associations/>} />
                    <Route path="/explorer" element={<Explorer/>} />
                    <Route path="/notification" element={<Notification/>} />
                    <Route path="/profile" element={<Profile/>} />
                    <Route path="/settings" element={<Settings setThemeName={setThemeName}/>} />
                </Routes>
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
    </BrowserRouter>
    </ApplicationContext.Provider>
    </ThemeProvider>
    )
}

export default App
