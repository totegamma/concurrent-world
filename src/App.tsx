import { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { darken, Box, createTheme, Drawer, Paper, Theme, ThemeProvider } from '@mui/material';

import { usePersistent } from './hooks/usePersistent';
import { useObjectList } from './hooks/useObjectList';
import { useResourceManager } from './hooks/useResourceManager';

import { Schemas } from './schemas';
import { Themes } from './themes';
import { Menu } from './components/Menu';
import type { RTMMessage, StreamElement, User } from './model';
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
    const [postStreams, setPostStreams] = usePersistent<string>("postStream", "common");
    const [currentStreams, setCurrentStreams] = usePersistent<string>("currentStream", "common,0");
    const [themeName, setThemeName] = usePersistent<string>("Theme", Object.keys(Themes)[0]);
    const [watchstreams, setWatchStreams] = usePersistent<string[]>("watchStreamList", ["common"]);
    const [theme, setTheme] = useState<Theme>(createTheme((Themes as any)[themeName]))
    const [inspectItem, setInspectItem] = useState<RTMMessage | null>(null)
    const messages = useObjectList<StreamElement>();

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
            setPostStreams={setPostStreams}
        />
        <Paper sx={{flexGrow: "1", margin: "10px", padding: "20px", display: "flex", flexFlow: "column", borderRadius: "20px"}}>
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
