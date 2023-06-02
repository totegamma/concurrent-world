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
import { CCAvatar } from '../components/CCAvatar'
import { useApi } from '../context/api'
import { Schemas } from '../schemas'
import { useFollow } from '../context/FollowContext'
import { Link } from 'react-router-dom'

export function HomeSettings(): JSX.Element {
    const api = useApi()
    const follow = useFollow()
    const [tab, setTab] = useState(0)

    const [defaultPostHome, setDefaultPostHome] = usePersistent<string[]>('defaultPostHome', [])
    const [defaultPostNonHome, setDefaultPostNonHome] = usePersistent<string[]>('defaultPostNonHome', [])

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
        <Box>
            <Tabs
                value={tab}
                onChange={(_, index) => {
                    setTab(index)
                }}
            >
                <Tab label="フォロー" />
                <Tab label="デフォルト投稿先" />
            </Tabs>
            {tab === 0 && (
                <Box sx={{ display: 'flex', gap: '10px', flexFlow: 'column', mt: '10px' }}>
                    <Box>
                        <Typography variant="h3" gutterBottom>
                            ストリーム
                        </Typography>
                        <StreamPicker
                            selected={follow.followingStreams}
                            setSelected={follow.setFollowingStreams}
                            sx={{ backgroundColor: 'primary.main' }}
                        />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h3" gutterBottom>
                            ユーザー
                        </Typography>
                        <List
                            dense
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper',
                                overflowY: 'auto'
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
                                    <ListItemButton component={Link} to={'/entity/' + user.ccaddress}>
                                        <ListItemAvatar>
                                            <CCAvatar avatarURL={user.avatar} identiconSource={user.ccaddress} />
                                        </ListItemAvatar>
                                        <ListItemText sx={{ color: 'primary.main' }} primary={user.username} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}
            {tab === 1 && (
                <Box sx={{ display: 'flex', gap: '10px', flexFlow: 'column', mt: '10px' }}>
                    <Box>
                        <Typography variant="h3" gutterBottom>
                            ホーム
                        </Typography>
                        <StreamPicker
                            selected={defaultPostHome}
                            setSelected={setDefaultPostHome}
                            sx={{ backgroundColor: 'primary.main' }}
                        />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h3" gutterBottom>
                            ホーム以外
                        </Typography>
                        <StreamPicker
                            selected={defaultPostNonHome}
                            setSelected={setDefaultPostNonHome}
                            sx={{ backgroundColor: 'primary.main' }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )
}
