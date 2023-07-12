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
import type { ProfileWithAddress } from '../model'
import { CCAvatar } from '../components/CCAvatar'
import { useApi } from '../context/api'
import { Schemas } from '@concurrent-world/client'
import { Link } from 'react-router-dom'
import { usePreference } from '../context/PreferenceContext'

export function HomeSettings(): JSX.Element {
    const api = useApi()
    const pref = usePreference()
    const [tab, setTab] = useState(0)

    const [followList, setFollowList] = useState<ProfileWithAddress[]>([])

    useEffect(() => {
        Promise.all(
            pref.followingUsers.map((ccaddress: string) =>
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
    }, [pref.followingUsers])

    const unfollow = (ccaddress: string): void => {
        pref.unfollowUser(ccaddress)
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
                        <Typography variant="h4" gutterBottom>
                            ストリーム
                        </Typography>
                        <StreamPicker
                            selected={pref.followingStreams}
                            setSelected={pref.setFollowingStreams}
                            sx={{ backgroundColor: 'background.default' }}
                        />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            ユーザー
                        </Typography>
                        <List
                            dense
                            sx={{
                                width: '100%',
                                bgcolor: 'primary.paper',
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
                        <Typography variant="h4" gutterBottom>
                            ホーム
                        </Typography>
                        <StreamPicker
                            selected={pref.defaultPostHome}
                            setSelected={pref.setDefaultPostHome}
                            sx={{ backgroundColor: 'primary.main' }}
                        />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            ホーム以外
                        </Typography>
                        <StreamPicker
                            selected={pref.defaultPostNonHome}
                            setSelected={pref.setDefaultPostNonHome}
                            sx={{ backgroundColor: 'primary.main' }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )
}
