import { useEffect, useState } from 'react'
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
import type { ProfileWithAddress } from '../model'
import { useLocation } from 'react-router-dom'
import { CCAvatar } from '../components/CCAvatar'
import { useApi } from '../context/api'
import { Schemas } from '../schemas'
import { useFollow } from '../context/FollowContext'

export function StreamInfo(): JSX.Element {
    const api = useApi()
    const follow = useFollow()
    const reactlocation = useLocation()
    const [tab, setTab] = useState(0)

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
        console.log(reactlocation.hash)
        if (!reactlocation.hash || reactlocation.hash === '#') {
            setTitle('Home')
            return
        }
        Promise.all(
            reactlocation.hash
                .replace('#', '')
                .split(',')
                .map((e) => api.readStream(e))
        ).then((a) => {
            console.log(a)
            setTitle(
                a
                    .map((e) => e?.payload.body.name)
                    .filter((e) => e)
                    .join(', ')
            )
        })
    }, [reactlocation.hash])

    const [followList, setFollowList] = useState<ProfileWithAddress[]>([])

    useEffect(() => {
        Promise.all(
            follow.followingUsers.map((ccaddress: string) =>
                api.readCharacter(ccaddress, Schemas.profile).then((e) => {
                    return {
                        ccaddress,
                        ...e?.payload.body
                    }
                })
            )
        ).then((e) => {
            setFollowList(e)
        })
    }, [follow.followingUsers])

    const unfollow = (ccaddress: string): void => {
        follow.unfollowUser(ccaddress)
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
                    ストリームをフォローするためには、まずExplorerタブでフォロー候補のストリームをお気に入り登録する必要があります。
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
                                selected={follow.followingStreams}
                                setSelected={follow.setFollowingStreams}
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
                            <Divider />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}
