import { type User } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { Box, Link, Tab, Tabs } from '@mui/material'
import { CCAvatar } from './ui/CCAvatar'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export interface AckListProps {
    initmode?: 'acking' | 'acker'
    user: User
}

export const AckList = (props: AckListProps): JSX.Element => {
    const [mode, setMode] = useState(props.initmode ?? 'acking')

    const [ackingUsers, setAckingUsers] = useState<User[]>([])
    const [ackerUsers, setAckerUsers] = useState<User[]>([])

    const { t } = useTranslation('', { keyPrefix: 'common' })

    useEffect(() => {
        let unmounted = false
        if (!props.user) return
        props.user.getAcker().then((ackers) => {
            if (unmounted) return
            setAckerUsers(ackers)
        })
        props.user.getAcking().then((acking) => {
            if (unmounted) return
            setAckingUsers(acking)
        })
        return () => {
            unmounted = true
        }
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
                <Tab value="acking" label={t('follow')} />
                <Tab value="acker" label={t('followers')} />
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
                    {(mode === 'acking' ? ackingUsers : ackerUsers).map((user) => (
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
                            <CCAvatar avatarURL={user.profile?.payload.body.avatar} identiconSource={user.ccid} />
                            <Link underline="hover">{user.profile?.payload.body.username}</Link>
                        </Box>
                    ))}
                </Box>
            </Box>
        </>
    )
}
