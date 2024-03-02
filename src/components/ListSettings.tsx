import { Box, Button, IconButton, List, ListItem, Switch, Tab, Tabs, TextField, Typography } from '@mui/material'
import { StreamPicker } from './ui/StreamPicker'
import { useEffect, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'
import { type CommonstreamSchema, type Stream } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { StreamLink, UserStreamLink } from './StreamList/StreamLink'
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import { useTranslation } from 'react-i18next'
import { type StreamList } from '../model'

export interface ListSettingsProps {
    id: string
}

export function ListSettings(props: ListSettingsProps): JSX.Element {
    const { client } = useClient()
    const [lists, setLists] = usePreference('lists')
    const [listName, setListName] = useState<string>('')

    const { t } = useTranslation('', { keyPrefix: 'ui.listSettings' })

    const list = lists[props.id]

    const [options, setOptions] = useState<Array<Stream<CommonstreamSchema>>>([])
    const [postStreams, setPostStreams] = useState<Array<Stream<CommonstreamSchema>>>([])

    const [tab, setTab] = useState<'stream' | 'user'>('stream')

    useEffect(() => {
        if (props.id) {
            const list = lists[props.id]
            if (list) {
                setListName(list.label)
            }
        }
    }, [props.id])

    useEffect(() => {
        Promise.all(list.streams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setOptions(streams.filter((e) => e !== null) as Array<Stream<CommonstreamSchema>>)
        })

        Promise.all(list.defaultPostStreams.map((streamID) => client.getStream(streamID))).then((streams) => {
            setPostStreams(streams.filter((stream) => stream !== null) as Array<Stream<CommonstreamSchema>>)
        })
    }, [props.id])

    const updateList = (id: string, list: StreamList): void => {
        const old = lists
        old[id] = list
        setLists(JSON.parse(JSON.stringify(old)))
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1
            }}
        >
            <Typography variant="h2">{t('title')}</Typography>
            <Typography variant="h3">{t('name')}</Typography>
            <Box display="flex" flexDirection="row">
                <TextField
                    label="list name"
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
                    onClick={(_) => {
                        updateList(props.id, {
                            ...list,
                            label: listName
                        })
                    }}
                >
                    {t('update')}
                </Button>
            </Box>
            <Typography variant="h3">{t('defaultDest')}</Typography>
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
                        updateList(props.id, {
                            ...list,
                            defaultPostStreams: value.map((e) => e.id)
                        })
                        setPostStreams(value)
                    }}
                />
            </Box>
            {props.id !== 'home' && (
                <>
                    <Typography variant="h3">{t('pin')}</Typography>
                    <Switch
                        checked={list.pinned}
                        onChange={(_) => {
                            updateList(props.id, {
                                ...list,
                                pinned: !list.pinned
                            })
                        }}
                    />
                    <Button
                        color="error"
                        onClick={(_) => {
                            const old = lists
                            delete old[props.id]
                            setLists(JSON.parse(JSON.stringify(old)))
                        }}
                    >
                        {t('delete')}
                    </Button>
                </>
            )}
            <Tabs
                value={tab}
                onChange={(_, value) => {
                    setTab(value)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab label={t('stream')} value="stream" />
                <Tab label={t('user')} value="user" />
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
                                        updateList(props.id, {
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
                                        updateList(props.id, {
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
        </Box>
    )
}
