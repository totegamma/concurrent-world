import { type User } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { type UserAckCollection } from '@concurrent-world/client/dist/types/schemas/userAckCollection'
import { Box, Link, Tab, Tabs } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'
import { Link as RouterLink } from 'react-router-dom'

export interface AckListProps {
    initmode?: 'acking' | 'acker'
    user: User
}

export const AckList = (props: AckListProps): JSX.Element => {
    const client = useApi()
    const [mode, setMode] = useState(props.initmode ?? 'acking')

    const [ackUsers, setAckUsers] = useState<User[]>([])
    const ackedUsers = props.user?.profile?.ackedby ?? []

    useEffect(() => {
        let collectionID = props.user.userstreams?.ackCollection
        if (!collectionID) return
        if (!collectionID.includes('@') && props.user.domain) {
            // WORKAROUND
            collectionID += '@' + props.user.domain
        }
        client.api.readCollection<UserAckCollection>(collectionID).then((ackCollection) => {
            if (!ackCollection) return
            Promise.all(ackCollection.items.map((item) => client.getUser(item.payload.ccid!))).then((users) => {
                setAckUsers(users.filter((user) => user !== null) as User[])
            })
        })
    }, [props.user])

    return (
        <>
            <Tabs
                value={mode}
                onChange={(_, value) => {
                    setMode(value)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab value="acking" label="追加済み" />
                <Tab value="acker" label="ファンリスト" />
            </Tabs>
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    flex: 1
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    {(mode === 'acking' ? ackUsers : ackedUsers).map((user) => (
                        <Box
                            key={user.ccid}
                            sx={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none'
                            }}
                            component={RouterLink}
                            to={`/entity/${user.ccid}`}
                        >
                            <CCAvatar avatarURL={user.profile?.avatar} identiconSource={user.ccid} />
                            <Link underline="hover">{user.profile?.username}</Link>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    )
}
