import { useEffect, useState, createContext, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
    darken,
    Box,
    createTheme,
    Paper,
    type Theme,
    ThemeProvider
} from '@mui/material'

import { usePersistent } from './hooks/usePersistent'
import { useObjectList } from './hooks/useObjectList'
import { useResourceManager } from './hooks/useResourceManager'

import { Schemas } from './schemas'
import { Themes } from './themes'
import { Menu } from './components/Menu'
import type {
    RTMMessage,
    StreamElement,
    User,
    ServerEvent,
    Association,
    Emoji
} from './model'
import {
    Associations,
    Explorer,
    Notification,
    Identity,
    Settings,
    Timeline
} from './pages'

import Sound from './resources/Bubble.wav'
import useSound from 'use-sound'
import { MobileMenu } from './components/MobileMenu'

export const ApplicationContext = createContext<appData>({
    serverAddress: '',
    publickey: '',
    privatekey: '',
    userAddress: '',
    profile: {
        pubkey: '',
        username: '',
        avatar: '',
        description: '',
        homestream: '',
        notificationstream: ''
    },
    emojiDict: {}
})

export interface appData {
    serverAddress: string
    publickey: string
    privatekey: string
    userAddress: string
    profile: User
    emojiDict: Record<string, Emoji>
}

function App(): JSX.Element {
    const [server, setServer] = usePersistent<string>('ServerAddress', '')
    const [pubkey, setPubKey] = usePersistent<string>('PublicKey', '')
    const [prvkey, setPrvKey] = usePersistent<string>('PrivateKey', '')
    const [address, setAddress] = usePersistent<string>('Address', '')
    const [followList, setFollowList] = usePersistent<string[]>(
        'followList',
        []
    )
    const [themeName, setThemeName] = usePersistent<string>(
        'Theme',
        Object.keys(Themes)[0]
    )
    const [watchstreams, setWatchStreams] = usePersistent<string[]>(
        'watchStreamList',
        ['common']
    )
    const [theme, setTheme] = useState<Theme>(
        createTheme((Themes as any)[themeName])
    )
    const [connected, setConnected] = useState<boolean>(false)
    const messages = useObjectList<StreamElement>()
    const [currentStreams, setCurrentStreams] = useState<string>('common')
    const currentStreamsRef = useRef<string>(currentStreams)

    const [playNotification] = useSound(Sound)
    const playNotificationRef = useRef(playNotification)
    const [profile, setProfile] = useState<User>({
        pubkey: '',
        username: 'anonymous',
        avatar: '',
        description: '',
        homestream: '',
        notificationstream: ''
    })
    const profileRef = useRef<User>(profile)
    useEffect(() => {
        playNotificationRef.current = playNotification
    }, [playNotification])

    const [emojiDict, setEmojiDict] = useState<Record<string, Emoji>>({})
    useEffect(() => {
        fetch(
            'https://gist.githubusercontent.com/totegamma/0beb41acad70aa4945ad38a6b00a3a1d/raw/8280287c34829b51a5544bec453c1638ecacd5e6/emojis.json'
        ) // FIXME temporaly hardcoded
            .then((j) => j.json())
            .then((data) => {
                const dict = Object.fromEntries(
                    data.emojis.map((e: any) => [e.emoji.name, e.emoji])
                )
                console.log(dict)
                setEmojiDict(dict)
            })
    }, [])

    const userDict = useResourceManager<User>(async (key: string) => {
        const res = await fetch(
            server +
                'characters?author=' +
                encodeURIComponent(key) +
                '&schema=' +
                encodeURIComponent(Schemas.profile),
            {
                method: 'GET',
                headers: {}
            }
        )
        const data = await res.json()
        if (data.characters.length === 0) {
            return {
                pubkey: '',
                username: 'anonymous',
                avatar: '',
                description: '',
                homestream: '',
                notificationstream: ''
            }
        }
        const payload = JSON.parse(data.characters[0].payload)
        return {
            pubkey: data.characters[0].author,
            username: payload.username,
            avatar: payload.avatar,
            description: payload.description,
            homestream: payload.home,
            notificationstream: payload.notification
        }
    })

    const messageDict = useResourceManager<RTMMessage>(async (key: string) => {
        const res = await fetch(server + `messages/${key}`, {
            method: 'GET',
            headers: {}
        })
        const data = await res.json()
        return data.message
    })

    const follow = (ccaddress: string): void => {
        if (followList.includes(ccaddress)) return
        setFollowList([...followList, ccaddress])
    }

    const handleMessage = (event: ServerEvent): void => {
        switch (event.type) {
            case 'message': {
                const message = event.body as RTMMessage
                switch (event.action) {
                    case 'create': {
                        if (
                            messages.current.find(
                                (e) => e.Values.id === message.id
                            ) != null
                        ) {
                            return
                        }
                        const groupA = currentStreamsRef.current.split(',')
                        const groupB = message.streams.split(',')
                        if (!groupA.some((e) => groupB.includes(e))) return
                        messages.push({
                            ID: new Date(message.cdate)
                                .getTime()
                                .toString()
                                .replace('.', '-'),
                            Values: {
                                id: message.id
                            }
                        })
                        playNotificationRef.current()
                        break
                    }
                    default:
                        console.log('unknown message action', event)
                        break
                }
                break
            }
            case 'association': {
                const association = event.body as Association
                console.log(event)
                switch (event.action) {
                    case 'create':
                        messageDict.invalidate(association.target)
                        // FIXME we have to notify to tweet component
                        break
                    case 'delete':
                        messageDict.invalidate(association.target)
                        // FIXME we have to notify to tweet component
                        break
                    default:
                        console.log('unknown message action', event)
                        break
                }
                break
            }
            default:
                console.log('unknown event', event)
                break
        }
    }

    useEffect(() => {
        ;(async () => {
            const profile = await userDict.get(address)
            setProfile(profile)
            profileRef.current = profile
        })()
    }, [])

    useEffect(() => {
        if (!server) return
        if (connected) return
        const ws = new WebSocket(server.replace('http', 'ws') + 'socket')

        ws.onopen = (event: any) => {
            console.log('ws open')
            console.info(event)
            setConnected(true)
        }

        ws.onmessage = (event: any) => {
            const body = JSON.parse(event.data)
            handleMessage(body)
        }

        ws.onerror = (event: any) => {
            console.log('ws error')
            console.error(event)
            setConnected(false)
        }

        ws.onclose = (event: any) => {
            console.log('ws closed')
            console.warn(event)
            setConnected(false)
        }
    }, [])

    useEffect(() => {
        currentStreamsRef.current = currentStreams
    }, [currentStreams])

    useEffect(() => {
        setTheme(createTheme((Themes as any)[themeName]))
    }, [themeName])

    return (
        <ThemeProvider theme={theme}>
            <ApplicationContext.Provider
                value={{
                    serverAddress: server,
                    publickey: pubkey,
                    privatekey: prvkey,
                    userAddress: address,
                    emojiDict,
                    profile
                }}
            >
                <BrowserRouter>
                    <Box
                        sx={{
                            display: 'flex',
                            padding: { xs: 0, sm: '10px' },
                            gap: '10px',
                            background: {
                                xs: theme.palette.background.default,
                                md: `linear-gradient(${
                                    theme.palette.background.default
                                }, ${darken(
                                    theme.palette.background.default,
                                    0.1
                                )})`
                            },
                            height: '100dvh'
                        }}
                    >
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Menu streams={watchstreams} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexFlow: 'column',
                                width: 1
                            }}
                        >
                            <Paper
                                sx={{
                                    flexGrow: '1',
                                    margin: '10px',
                                    display: 'flex',
                                    flexFlow: 'column',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    background: 'none'
                                }}
                            >
                                <Routes>
                                    <Route
                                        index
                                        element={
                                            <Timeline
                                                messages={messages}
                                                messageDict={messageDict}
                                                userDict={userDict}
                                                follow={follow}
                                                followList={followList}
                                                setCurrentStreams={
                                                    setCurrentStreams
                                                }
                                                watchstreams={watchstreams}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/associations"
                                        element={<Associations />}
                                    />
                                    <Route
                                        path="/explorer"
                                        element={
                                            <Explorer
                                                watchList={watchstreams}
                                                setWatchList={setWatchStreams}
                                                followList={followList}
                                                setFollowList={setFollowList}
                                                userDict={userDict}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/notification"
                                        element={<Notification />}
                                    />
                                    <Route
                                        path="/identity"
                                        element={<Identity />}
                                    />
                                    <Route
                                        path="/settings"
                                        element={
                                            <Settings
                                                setThemeName={setThemeName}
                                                setPrvKey={setPrvKey}
                                                setPubKey={setPubKey}
                                                setUserAddr={setAddress}
                                                setServerAddr={setServer}
                                            />
                                        }
                                    />
                                </Routes>
                            </Paper>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                <MobileMenu />
                            </Box>
                        </Box>
                    </Box>
                </BrowserRouter>
            </ApplicationContext.Provider>
        </ThemeProvider>
    )
}

export default App
