import { type User } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { type UserAckCollection } from '@concurrent-world/client/dist/types/schemas/userAckCollection'
import { Box, Tab, Tabs, Typography } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'

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
            {(mode === 'acking' ? ackUsers : ackedUsers).map((user) => (
                <Box
                    key={user.ccid}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <CCAvatar avatarURL={user.profile?.avatar} identiconSource={user.ccid} />
                    <Typography>{user.profile?.username}</Typography>
                </Box>
            ))}
        </>
    )
}
