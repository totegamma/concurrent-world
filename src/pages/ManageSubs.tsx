import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from '@mui/material'
import { useClient } from '../context/ClientContext'
import { useTranslation } from 'react-i18next'
import { usePreference } from '../context/PreferenceContext'

import { useEffect, useState } from 'react'
import { Schemas, type CoreSubscription } from '@concurrent-world/client'

import AddIcon from '@mui/icons-material/Add'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

import { ListSettings } from '../components/ListSettings'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type StreamList } from '../model'
import { useGlobalActions } from '../context/GlobalActions'
import { ListItemSubscription } from '../components/ui/ListItemSubscription'

export function ManageSubsPage(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'pages.contacts' })
    const { client } = useClient()
    const [lists, setLists] = usePreference('lists')

    const actions = useGlobalActions()

    const [ownSubscriptions, setOwnSubscriptions] = useState<Array<CoreSubscription<any>>>([])
    const listedSubs: string[] = Object.keys(lists)
    const unlistedSubs: Array<CoreSubscription<any>> = ownSubscriptions.filter(
        (sub) => !Object.keys(lists).includes(sub.id)
    )
    const [inspectedSub, setInspectedSub] = useState<CoreSubscription<any> | null>(null)

    const [reloader, setReloader] = useState<number>(0)

    useEffect(() => {
        client.api.getOwnSubscriptions<any>().then((subs) => {
            setOwnSubscriptions(subs)
        })
    }, [reloader])

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'background.paper',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    padding: '20px 20px 0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <Typography variant="h2">リストの管理</Typography>

                <Divider
                    sx={{
                        margin: '10px 0'
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1',
                        gap: 1,
                        mb: 2
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography variant="h3">表示中のリスト</Typography>
                        <Button
                            onClick={() => {
                                client.api
                                    .upsertSubscription(
                                        Schemas.listSubscription,
                                        {
                                            name: '新しいリスト'
                                        },
                                        { indexable: false, domainOwned: false }
                                    )
                                    .then((subscription) => {
                                        console.log(subscription)
                                        setReloader((prev) => prev + 1)
                                    })
                                    .catch((error) => {
                                        console.error(error)
                                    })
                            }}
                            endIcon={<AddIcon />}
                        >
                            新規作成
                        </Button>
                    </Box>

                    <List dense disablePadding>
                        {listedSubs.map((subid, i) => (
                            <ListItemSubscription
                                id={subid}
                                key={subid}
                                onClick={() => {
                                    const target = ownSubscriptions.find((sub) => sub.id === subid)
                                    if (target) {
                                        setInspectedSub(target)
                                    } else {
                                        console.error('not found')
                                    }
                                }}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            disabled={i === 0}
                                            onClick={() => {
                                                const keys = Object.keys(lists)
                                                const tmp = keys[i]
                                                keys[i] = keys[i - 1]
                                                keys[i - 1] = tmp

                                                const newLists = new Map<string, StreamList>()
                                                for (const key of keys) {
                                                    newLists.set(key, lists[key])
                                                }

                                                setLists(Object.fromEntries(newLists))
                                            }}
                                        >
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                        <IconButton
                                            disabled={i === listedSubs.length - 1}
                                            onClick={() => {
                                                const keys = Object.keys(lists)
                                                const tmp = keys[i]
                                                keys[i] = keys[i + 1]
                                                keys[i + 1] = tmp

                                                const newLists = new Map<string, StreamList>()
                                                for (const key of keys) {
                                                    newLists.set(key, lists[key])
                                                }

                                                setLists(Object.fromEntries(newLists))
                                            }}
                                        >
                                            <ArrowDownwardIcon />
                                        </IconButton>
                                        <IconButton
                                            disabled={listedSubs.length === 1}
                                            onClick={() => {
                                                const old = lists
                                                delete old[subid]
                                                setLists(old)
                                            }}
                                        >
                                            <RemoveCircleOutlineIcon />
                                        </IconButton>
                                    </Box>
                                }
                            />
                        ))}
                    </List>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1',
                        gap: 1
                    }}
                >
                    <Typography variant="h3" gutterBottom>
                        非表示のリスト
                    </Typography>
                    <List dense disablePadding>
                        {unlistedSubs.map((sub) => (
                            <ListItem
                                dense
                                disablePadding
                                key={sub.id}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            onClick={() => {
                                                const old = lists
                                                old[sub.id] = {
                                                    pinned: false,
                                                    expanded: false,
                                                    defaultPostStreams: ['all']
                                                }
                                                setLists(old)
                                            }}
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemButton
                                    dense
                                    onClick={() => {
                                        setInspectedSub(sub)
                                    }}
                                >
                                    <ListItemText primary={sub.document.body?.name ?? sub.id} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
            <CCDrawer
                open={!!inspectedSub}
                onClose={() => {
                    setInspectedSub(null)
                }}
            >
                {inspectedSub ? (
                    <ListSettings
                        subscription={inspectedSub}
                        onModified={() => {
                            setReloader((prev) => prev + 1)
                            actions.reloadList()
                            setInspectedSub(null)
                        }}
                    />
                ) : (
                    <>Loading...</>
                )}
            </CCDrawer>
        </Box>
    )
}
