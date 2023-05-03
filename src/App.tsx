import { useEffect, useState, createContext, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { darken, Box, createTheme, Paper, Theme, ThemeProvider } from '@mui/material';

import { usePersistent } from './hooks/usePersistent';
import { useObjectList } from './hooks/useObjectList';
import { useResourceManager } from './hooks/useResourceManager';

import { Schemas } from './schemas';
import { Themes } from './themes';
import { Menu } from './components/Menu';
import type { RTMMessage, StreamElement, User, ServerEvent, Association } from './model';
import { Associations, Explorer, Notification, Profile, Settings, Timeline } from './pages';

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

    const [server, setServer] = usePersistent<string>("ServerAddress", "");
    const [pubkey, setPubKey] = usePersistent<string>("PublicKey", "");
    const [prvkey, setPrvKey] = usePersistent<string>("PrivateKey", "");
    const [address, setAddress] = usePersistent<string>("Address", "");
    const [currentStreams, setCurrentStreams] = usePersistent<string>("currentStream", "common");
    const [themeName, setThemeName] = usePersistent<string>("Theme", Object.keys(Themes)[0]);
    const [watchstreams, setWatchStreams] = usePersistent<string[]>("watchStreamList", ["common"]);
    const [theme, setTheme] = useState<Theme>(createTheme((Themes as any)[themeName]))
    const [connected, setConnected] = useState<boolean>(false)
    const messages = useObjectList<StreamElement>();
    const currentStreamsRef = useRef<string>(currentStreams)


    const userDict = useResourceManager<User>(async (key: string) => {
        const res = await fetch(server + 'characters?author=' + encodeURIComponent(key) + '&schema=' + encodeURIComponent(Schemas.profile), {
            method: 'GET',
            headers: {}
        });
        const data = await res.json();
        if (data.characters.length == 0) return {
            pubkey: '',
            username: 'anonymous',
            avatar: '',
            description: ''
        };
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
        return data.message
    });

    const reload = useCallback(() => {
        console.warn('reload!')
        let url = server + `stream?streams=${currentStreams}`

        const requestOptions = {
            method: 'GET',
            headers: {}
        };

        fetch(url, requestOptions)
        .then(res => res.json())
        .then((data: StreamElement[]) => {
            messages.clear();
            data.sort((a, b) => a.ID < b.ID ? -1 : 1).forEach((e: StreamElement) => messages.push(e));
        });
    }, [server])

    const handleMessage = (event: ServerEvent) => {
        switch(event.type) {
            case "message":
                const message = event.body as RTMMessage
                switch(event.action) {
                    case "create":
                        if (messages.current.find(e => e.Values.id == message.id)) return;
                        const groupA = currentStreamsRef.current.split(',')
                        const groupB = message.streams.split(',')
                        if (!groupA.some(e => groupB.includes(e))) return;
                        messages.push({
                            ID: new Date(message.cdate).getTime().toString().replace('.', '-'),
                            Values: {
                                id: message.id
                            }
                        })
                    break;
                    default:
                        console.log("unknown message action", event)
                    break;
                }
            break;
            case "association":
                const association = event.body as Association
                console.log(event)
                switch(event.action) {
                    case "create":
                        messageDict.invalidate(association.target)
                        // FIXME we have to notify to tweet component 
                    break;
                    case "delete":
                        messageDict.invalidate(association.target)
                        // FIXME we have to notify to tweet component 
                    break;
                    default:
                        console.log("unknown message action", event)
                    break;
                }
            break;
            default:
                console.log("unknown event", event)
            break;
        }
    }

    useEffect(() => {
        if (!server) return
        const ws = new WebSocket(server.replace('http', 'ws') + 'socket');

        ws.onopen = (event: any) => {
            console.log("ws open");
            console.info(event);
            setConnected(true);
        }

        ws.onmessage = (event: any) => {
            const body = JSON.parse(event.data);
            handleMessage(body);
        }

        ws.onerror = (event: any) => {
            console.log("ws error");
            console.error(event);
            setConnected(false);
        }

        ws.onclose = (event: any) => {
            console.log("ws closed");
            console.warn(event);
            setConnected(false);
        }
    }, []);

    useEffect(() => {
        currentStreamsRef.current = currentStreams
    }, [currentStreams]);

    useEffect(() => {
        reload()
    }, [currentStreams])

    useEffect(() => {
        setTheme(createTheme((Themes as any)[themeName]))
    }, [themeName]);

    return (
    <ThemeProvider theme={theme}>
    <ApplicationContext.Provider value={{serverAddress: server, publickey: pubkey, privatekey: prvkey, userAddress: address}}>
    <BrowserRouter>
    <Box sx={{display: "flex", padding: "10px", gap: "10px", background: `linear-gradient(${theme.palette.background.default}, ${darken(theme.palette.background.default, 0.1)})`, height: "100vh"}}>
        <Menu
            streams={watchstreams}
            setCurrentStreams={setCurrentStreams}
        />
        <Paper sx={{flexGrow: "1", margin: "10px", display: "flex", flexFlow: "column", borderRadius: "20px", overflow: 'hidden'}}>
            <Routes>
                <Route index element={ 
                    <Timeline
                        messages={messages}
                        messageDict={messageDict}
                        userDict={userDict}
                        currentStreams={currentStreams}
                        setCurrentStreams={setCurrentStreams}
                        reload={reload}
                    />
                } />
                <Route path="/associations" element={<Associations/>} />
                <Route path="/explorer" element={
                    <Explorer
                        watchList={watchstreams}
                        setWatchList={setWatchStreams}
                    />
                } />
                <Route path="/notification" element={<Notification/>} />
                <Route path="/profile" element={<Profile/>} />
                <Route path="/settings" element={
                    <Settings
                        setThemeName={setThemeName}
                        setPrvKey={setPrvKey}
                        setPubKey={setPubKey}
                        setUserAddr={setAddress}
                        setServerAddr={setServer}
                    />}
                />
            </Routes>
        </Paper>
    </Box>
    </BrowserRouter>
    </ApplicationContext.Provider>
    </ThemeProvider>
    )
}

export default App
