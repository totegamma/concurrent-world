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
    Avatar,
    ListItemText
} from '@mui/material'
import { StreamPicker } from './StreamPicker'
import { usePersistent } from '../hooks/usePersistent'
import type { User } from '../model'
import { ApplicationContext } from '../App'

export interface NavigatorSettingsProps {
    followList: string[]
    setFollowList: (newlist: string[]) => void
}

export function NavigatorSettings(props: NavigatorSettingsProps): JSX.Element {
    const appData = useContext(ApplicationContext)
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

    const [followList, setFollowList] = useState<User[]>([])

    useEffect(() => {
        Promise.all(
            props.followList.map((ccaddress) => appData.userDict.get(ccaddress))
        ).then((e) => {
            setFollowList(e)
        })
    }, [props.followList])

    const unfollow = (ccaddress: string): void => {
        props.setFollowList(props.followList.filter((e) => e !== ccaddress))
    }

    return (
        <Box>
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
                            maxWidth: 360,
                            maxHeight: '300px',
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
                                        <Avatar src={user.avatar} />
                                    </ListItemAvatar>
                                    <ListItemText primary={user.username} />
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
        </Box>
    )
}
