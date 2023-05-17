import { useContext, useEffect, useState } from 'react'
import {
    Divider,
    Tabs,
    Box,
    Tab,
    Typography,
    List,
    ListItem,
    Button,
    ListItemButton,
    ListItemAvatar,
    ListItemText
} from '@mui/material'
import { StreamPicker } from '../components/StreamPicker'
import { usePersistent } from '../hooks/usePersistent'
import type { User } from '../model'
import { ApplicationContext } from '../App'
import { useLocation } from 'react-router-dom'
import { CCAvatar } from '../components/CCAvatar'

export interface StreamInfoProps {
    followList: string[]
    setFollowList: (newlist: string[]) => void
}

export function StreamInfo(props: StreamInfoProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const reactlocation = useLocation()
    const [tab, setTab] = useState(0)

    const [followStreams, setFollowStreams] = usePersistent<string[]>(
        'followStreams',
        []
    )
    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>(
        'defaultPostHome',
        []
    )
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>(
        'defaultPostNonHome',
        []
    )

    const [title, setTitle] = useState<string>('')

    useEffect(() => {
        if (!reactlocation.hash || reactlocation.hash === '#') {
            setTitle('Home')
            return
        }
        Promise.all(
            reactlocation.hash
                .replace('#', '')
                .split(',')
                .map((e) => appData.streamDict.get(e))
        ).then((a) => {
            setTitle(
                a
                    .map((e) => e.meta)
                    .filter((e) => e)
                    .map((e) => JSON.parse(e).name)
                    .join(', ')
            )
        })
    }, [reactlocation.hash])

    const [followList, setFollowList] = useState<User[]>([])

    useEffect(() => {
        Promise.all(
            props.followList.map((ccaddress) => appData.userDict.get(ccaddress))
        ).then((e) => {
            setFollowList(e.filter((e) => e.ccaddress))
        })
    }, [props.followList])

    const unfollow = (ccaddress: string): void => {
        props.setFollowList(props.followList.filter((e) => e !== ccaddress))
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography variant="h2">{title}</Typography>
            <Divider />
            {title !== 'Home' && <>このストリームについて...</>}
            {title === 'Home' && (
                <>
                    <Typography variant="h2">Navigator Settings</Typography>
                    <Divider />
                    <Tabs
                        value={tab}
                        onChange={(_, index) => {
                            setTab(index)
                        }}
                    >
                        <Tab label="フォロー" />
                        <Tab label="投稿先" />
                    </Tabs>
                    {tab === 0 && (
                        <Box>
                            <Typography variant="h3">ストリーム</Typography>
                            <StreamPicker
                                selected={followStreams}
                                setSelected={setFollowStreams}
                            />
                            <Divider />
                            <Typography variant="h3">ユーザー</Typography>
                            <List
                                dense
                                sx={{
                                    width: '100%',
                                    bgcolor: 'background.paper',
                                    overflow: 'scroll'
                                }}
                            >
                                {followList.map((user) => (
                                    <ListItem
                                        key={user.ccaddress}
                                        secondaryAction={
                                            <Button
                                                onClick={() => {
                                                    unfollow(user.ccaddress)
                                                }}
                                            >
                                                unfollow
                                            </Button>
                                        }
                                        disablePadding
                                    >
                                        <ListItemButton>
                                            <ListItemAvatar>
                                                <CCAvatar
                                                    avatarURL={user.avatar}
                                                    identiconSource={
                                                        user.ccaddress
                                                    }
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.username}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                    {tab === 1 && (
                        <Box>
                            <Typography variant="h3">ホーム</Typography>
                            <StreamPicker
                                selected={defaultPostHome}
                                setSelected={setDefaultPostHome}
                            />
                            <Divider />
                            <Typography variant="h3">ホーム以外</Typography>
                            <StreamPicker
                                selected={defaultPostNonHome}
                                setSelected={setDefaultPostNonHome}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}
