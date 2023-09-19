import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { useEffect, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'
import { StreamLink, UserStreamLink } from './StreamList/StreamLink'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'

export interface ListSettingsProps {
    id: string
}

export function ListSettings(props: ListSettingsProps): JSX.Element {
    const client = useApi()
    const pref = usePreference()
    const [listName, setListName] = useState<string>('')

    const list = pref.lists[props.id]

    const [options, setOptions] = useState<Stream[]>([])
    const [postStreams, setPostStreams] = useState<Stream[]>([])

    const [tab, setTab] = useState<'stream' | 'user'>('stream')

    useEffect(() => {
        if (props.id) {
            const list = pref.lists[props.id]
            if (list) {
                setListName(list.label)
            }
        }
    }, [props.id])

    useEffect(() => {
        Promise.all(list.streams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setOptions(streams.filter((e) => e !== null) as Stream[])
        })

        Promise.all(list.defaultPostStreams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setPostStreams(streams.filter((stream) => stream !== null) as Stream[])
        })
    }, [props.id])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3.5,
                p: 2.5,
                paddingTop: 5
            }}
        >
            <Typography variant="h2">リスト設定</Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    paddingLeft: 0.3
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Typography variant="h3">リスト名</Typography>
                    <Box display="flex" flexDirection="row">
                        <TextField
                            label="New name"
                            variant="outlined"
                            value={listName}
                            sx={{
                                flexGrow: 1
                            }}
                            onChange={(e) => {
                                setListName(e.target.value)
                            }}
                        />
                        <Button
                            disabled={listName === list.label}
                            variant="contained"
                            onClick={(_) => {
                                pref.updateList(props.id, {
                                    ...list,
                                    label: listName
                                })
                            }}
                            color="success"
                        >
                            Update
                        </Button>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <Divider />
                    <Typography variant="h3">デフォルト投稿先</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: 1
                        }}
                    >
                        <StreamPicker
                            options={options}
                            selected={postStreams}
                            setSelected={(value) => {
                                pref.updateList(props.id, {
                                    ...list,
                                    defaultPostStreams: value.map((e) => e.id)
                                })
                                setPostStreams(value)
                            }}
                        />
                    </Box>
                </Box>
                {props.id !== 'home' && (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Divider />
                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                <Typography variant="h3">リストタブにこのリストを表示する</Typography>
                                <Switch
                                    checked={list.pinned}
                                    onChange={(_) => {
                                        pref.updateList(props.id, {
                                            ...list,
                                            pinned: !list.pinned
                                        })
                                    }}
                                />
                            </Box>
                            他のリストから簡単に切り替えることができます。
                        </Box>
                    </>
                )}
            </Box>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, value) => {
                    setTab(value)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label="ストリーム" value="stream" />
                <Tab label="ユーザー" value="user" />
            </Tabs>
            <List>
                {tab === 'stream' &&
                    list.streams.map((streamID) => (
                        <ListItem
                            key={streamID}
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    onClick={(_) => {
                                        pref.updateList(props.id, {
                                            ...list,
                                            streams: list.streams.filter((e) => e !== streamID)
                                        })
                                    }}
                                >
                                    <PlaylistRemoveIcon />
                                </IconButton>
                            }
                        >
                            <StreamLink streamID={streamID} />
                        </ListItem>
                    ))}
                {tab === 'user' &&
                    list.userStreams.map((userstream) => (
                        <ListItem
                            key={userstream.streamID}
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    onClick={(_) => {
                                        pref.updateList(props.id, {
                                            ...list,
                                            userStreams: list.userStreams.filter(
                                                (e) => e.streamID !== userstream.streamID
                                            )
                                        })
                                    }}
                                >
                                    <PlaylistRemoveIcon />
                                </IconButton>
                            }
                        >
                            <UserStreamLink userHomeStream={userstream} />
                        </ListItem>
                    ))}
            </List>
            {props.id !== 'home' && (
                <Button
                    variant="contained"
                    color="error"
                    onClick={(_) => {
                        const old = pref.lists
                        delete old[props.id]
                        pref.setLists(JSON.parse(JSON.stringify(old)))
                    }}
                >
                    リストを削除
                </Button>
            )}
        </Box>
    )
}
