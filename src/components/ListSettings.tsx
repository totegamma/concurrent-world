import { Box, Button, Switch, TextField, Typography } from '@mui/material'
import { StreamPicker } from './StreamPicker'
import { useEffect, useState } from 'react'
import { usePreference } from '../context/PreferenceContext'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../context/api'

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

    useEffect(() => {
        if (props.id) {
            const list = pref.lists[props.id]
            if (list) {
                setListName(list.label)
            }
        }
    }, [props.id])

    useEffect(() => {
        const streamIDs = list.items.filter((e) => e.type === 'stream').map((e) => e.id)
        Promise.all(streamIDs.map((streamID) => client.getStream(streamID))).then((streams) => {
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
                gap: 1,
                p: 1
            }}
        >
            <Typography variant="h2">リスト設定</Typography>
            <Typography variant="h3">リスト名</Typography>
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
                    variant="contained"
                    onClick={(_) => {
                        pref.updateList(props.id, {
                            label: listName,
                            pinned: list.pinned,
                            items: list.items,
                            expanded: list.expanded,
                            defaultPostStreams: list.defaultPostStreams
                        })
                    }}
                >
                    Update
                </Button>
            </Box>
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
            {props.id !== 'home' && (
                <>
                    <Typography variant="h3">リストのピン</Typography>
                    <Switch
                        checked={list.pinned}
                        onChange={(_) => {
                            pref.updateList(props.id, {
                                ...list,
                                pinned: !list.pinned
                            })
                        }}
                    />
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
                </>
            )}
        </Box>
    )
}
