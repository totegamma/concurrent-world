import { Box, Button, Typography, Link, Divider, Skeleton } from '@mui/material'

import { CCAvatar } from '../components/ui/CCAvatar'
import { WatchButton } from '../components/WatchButton'
import { AckButton } from '../components/AckButton'
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer'

import { Link as NavLink } from 'react-router-dom'

import { useEffect, useState } from 'react'
import { type CoreProfile, type User } from '@concurrent-world/client'
import { useClient } from '../context/ClientContext'
import { CCDrawer } from './ui/CCDrawer'
import { AckList } from '../components/AckList'
import { CCWallpaper } from './ui/CCWallpaper'
import { useTranslation } from 'react-i18next'
import { SubprofileBadge } from './ui/SubprofileBadge'
import { ProfileProperties } from './ui/ProfileProperties'
import { enqueueSnackbar } from 'notistack'

export interface ProfileProps {
    user: User
    id?: string
    guest?: boolean
    onSubProfileClicked?: (characterID: string) => void
    overrideSubProfileID?: string
}

type detail = 'none' | 'ack' | 'acker'

export function Profile(props: ProfileProps): JSX.Element {
    const { client } = useClient()

    const isSelf = props.id === client.ccid

    const [detailMode, setDetailMode] = useState<detail>('none')
    const [ackingUsers, setAckingUsers] = useState<User[] | undefined>(undefined)
    const [ackerUsers, setAckerUsers] = useState<User[] | undefined>(undefined)

    const [subProfile, setSubProfile] = useState<CoreProfile<any> | null>(null)

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

    useEffect(() => {
        if (!client || !props.overrideSubProfileID) {
            setSubProfile(null)
            return
        }
        client.api.getProfileByID(props.overrideSubProfileID, props.user.ccid).then((character) => {
            setSubProfile(character ?? null)
        })
    }, [client, props.overrideSubProfileID, props.user.ccid])

    return (
        <>
            <CCWallpaper
                override={props.user.profile?.banner}
                sx={{
                    height: '150px'
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    position: 'relative',
                    mt: '-64px'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            alignItems: 'baseline'
                        }}
                    >
                        <CCAvatar
                            alt={props.user.profile?.username}
                            avatarURL={props.user.profile?.avatar}
                            avatarOverride={subProfile ? subProfile.document.body.avatar : undefined}
                            identiconSource={props.user.ccid}
                            sx={{
                                width: '100px',
                                height: '100px'
                            }}
                            onBadgeClick={() => {
                                props.onSubProfileClicked?.('')
                            }}
                        />
                        {props.user.profile?.subprofiles?.map((id, _) => (
                            <SubprofileBadge
                                key={id}
                                characterID={id}
                                authorCCID={props.user.ccid}
                                onClick={() => {
                                    props.onSubProfileClicked?.(id)
                                }}
                            />
                        ))}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            mt: 1,
                            alignItems: 'end',
                            ml: 'auto'
                        }}
                    >
                        {!isSelf && <AckButton user={props.user} />}
                        <WatchButton timelineID={props.user.homeTimeline ?? ''} />
                        {isSelf && (
                            <Button variant="outlined" component={NavLink} to="/settings/profile">
                                Edit Profile
                            </Button>
                        )}
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem' },
                            cursor: 'pointer',
                            mt: 1
                        }}
                        onClick={() => {
                            const userid = props.user.alias ?? props.user.ccid
                            navigator.clipboard.writeText('https://concrnt.world/' + userid)
                            enqueueSnackbar('リンクをコピーしました', { variant: 'success' })
                        }}
                    >
                        {subProfile?.document.body.username ?? props.user.profile?.username ?? 'anonymous'}
                    </Typography>
                    {props.user.alias && <Typography variant="caption">{props.user.alias}</Typography>}
                </Box>
                <Typography variant="caption">{props.user.ccid}</Typography>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <MarkdownRenderer
                        messagebody={subProfile?.document.body.description ?? props.user.profile?.description ?? ''}
                        emojiDict={{}}
                    />
                </Box>

                <Box>
                    <Typography variant="caption">
                        現住所: {props.user.domain !== '' ? props.user.domain : client.api.host}
                    </Typography>
                </Box>

                <Box display="flex" gap={1}>
                    <Typography
                        component={Link}
                        underline="hover"
                        onClick={() => {
                            setDetailMode('ack')
                        }}
                    >
                        {ackingUsers ? (
                            <>
                                {ackingUsers.length} {t('follow')}
                            </>
                        ) : (
                            <Skeleton variant="text" width={80} />
                        )}
                    </Typography>
                    <Typography
                        component={Link}
                        underline="hover"
                        onClick={() => {
                            setDetailMode('acker')
                        }}
                    >
                        {ackerUsers ? (
                            <>
                                {ackerUsers.length} {t('followers')}
                            </>
                        ) : (
                            <Skeleton variant="text" width={80} />
                        )}
                    </Typography>
                </Box>

                {subProfile && (
                    <>
                        <Divider sx={{ mb: 1 }} />
                        <ProfileProperties showCreateLink character={subProfile} />
                        <Divider />
                    </>
                )}
            </Box>

            <CCDrawer
                open={detailMode !== 'none'}
                onClose={() => {
                    setDetailMode('none')
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexFlow: 'column',
                        gap: 1,
                        p: 1
                    }}
                >
                    {detailMode !== 'none' && (
                        <AckList initmode={detailMode === 'ack' ? 'acking' : 'acker'} user={props.user} />
                    )}
                </Box>
            </CCDrawer>
        </>
    )
}
