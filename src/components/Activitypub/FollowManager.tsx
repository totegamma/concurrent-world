import { memo, useEffect, useState } from 'react'
import { useApi } from '../../context/api'
import { Avatar, Box, Button, Divider, IconButton, Link, Paper, TextField, Typography } from '@mui/material'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { CCDrawer } from '../ui/CCDrawer'

interface Stats {
    follows: string[]
    followers: string[]
}

export const ApFollowManager = (): JSX.Element => {
    const client = useApi()
    const [stats, setStats] = useState<Stats | null>(null)
    const [userID, setUserID] = useState('')
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const follow = (target: string): void => {
        client.api
            .fetchWithCredential(client.api.host, `/ap/api/follow/${target}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                getStats()
                setDrawerOpen(false)
            })
    }

    const unFollow = (target: string): void => {
        client.api
            .fetchWithCredential(client.api.host, `/ap/api/follow/${target}`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                getStats()
            })
    }

    const getStats = (): void => {
        client.api
            .fetchWithCredential(client.api.host, `/ap/api/stats`, {})
            .then(async (res) => await res.json())
            .then((data) => {
                setStats(data.content)
            })
    }

    useEffect(() => {
        getStats()
    }, [])

    return (
        <>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} gap={1}>
                <Box flex={1} display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" height="40px">
                        <Typography variant="h2">{stats?.follows.length}フォロー</Typography>
                        <IconButton
                            sx={{
                                backgroundColor: 'primary.main',
                                mx: 1,
                                '&:hover': {
                                    backgroundColor: 'primary.dark'
                                }
                            }}
                            onClick={() => {
                                setDrawerOpen(true)
                            }}
                        >
                            <PersonAddAlt1Icon
                                sx={{
                                    color: 'primary.contrastText'
                                }}
                            />
                        </IconButton>
                    </Box>
                    {stats?.follows.map((x) => (
                        <APUserCard
                            key={x}
                            url={x}
                            remove={(a) => {
                                unFollow(a)
                            }}
                        />
                    ))}
                </Box>
                <Box flex={1} display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" height="40px">
                        <Typography variant="h2">{stats?.followers.length}フォロワー</Typography>
                    </Box>
                    {stats?.followers.map((x) => (
                        <APUserCard key={x} url={x} />
                    ))}
                </Box>
            </Box>
            <CCDrawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false)
                }}
            >
                <Box display="flex" flexDirection="column" p={1} gap={1}>
                    <Typography variant="h2">Activitypubユーザーのフォロー</Typography>
                    <Divider />
                    <TextField
                        label="follow"
                        placeholder="@username@host"
                        value={userID}
                        onChange={(x) => {
                            setUserID(x.target.value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            follow(userID)
                        }}
                    >
                        follow
                    </Button>
                </Box>
            </CCDrawer>
        </>
    )
}

export const APUserCard = memo<{ url: string; remove?: (_: string) => void }>(
    (props: { url: string; remove?: (_: string) => void }): JSX.Element => {
        const client = useApi()
        const [person, setPerson] = useState<any>(null)
        const host = props.url.split('/')[2]
        const shortID = `@${person?.preferredUsername}@${host}`

        useEffect(() => {
            client.api
                .fetchWithCredential(client.api.host, `/ap/api/resolve/${encodeURIComponent(props.url)}`, {
                    method: 'GET',
                    headers: {
                        accept: 'application/ld+json'
                    }
                })
                .then(async (res) => await res.json())
                .then((data) => {
                    setPerson(data.content)
                })
        }, [props.url])

        console.log(person)

        if (!person) return <>loading...</>

        return (
            <Paper
                sx={{
                    display: 'flex',
                    p: 1,
                    backgroundImage: person.image ? `url(${person.image.url})` : undefined,
                    backgroundSize: 'cover',
                    gap: 1,
                    textDecoration: 'none'
                }}
            >
                <Avatar src={person.icon?.url} />
                <Box
                    sx={{
                        display: 'flex',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        p: 1,
                        borderRadius: 1,
                        flexDirection: 'column',
                        flex: 1
                    }}
                >
                    <Typography variant="h3">{person.name || person.preferredUsername}</Typography>
                    <Link underline="hover" href={props.url} target="_blank" rel="noopener noreferrer">
                        @{person.preferredUsername}@{host}
                    </Link>
                </Box>
                {props.remove && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <IconButton
                            onClick={() => props.remove?.(shortID)}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,1)'
                                }
                            }}
                        >
                            <PersonRemoveIcon />
                        </IconButton>
                    </Box>
                )}
            </Paper>
        )
    }
)

APUserCard.displayName = 'APUserCard'
