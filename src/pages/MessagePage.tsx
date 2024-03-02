import {
    Box,
    Divider,
    List,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Tab,
    Tabs,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { useClient } from '../context/ClientContext'
import { useEffect, useState } from 'react'
import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema,
    type Association,
    type LikeSchema,
    type EmojiAssociationSchema,
    type ReplyAssociationSchema,
    type RerouteAssociationSchema
} from '@concurrent-world/client'
import { MessageView } from '../components/Message/MessageView'
import { Draft } from '../components/Draft'
import { useGlobalActions } from '../context/GlobalActions'
import { RerouteMessageFrame } from '../components/Message/RerouteMessageFrame'
import { FavoriteAssociation } from '../components/Association/FavoriteAssociation'
import { ReactionAssociation } from '../components/Association/ReactionAssociation'

import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

export function MessagePage(): JSX.Element {
    const { id } = useParams()
    const { client } = useClient()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]
    const lastUpdated = 0

    const actions = useGlobalActions()

    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const [replies, setReplies] = useState<
        Array<{
            association?: Association<ReplyAssociationSchema>
            message?: Message<ReplyMessageSchema>
        }>
    >([])
    const [reroutes, setReroutes] = useState<
        Array<{
            association?: Association<RerouteAssociationSchema>
            message?: Message<RerouteMessageSchema>
        }>
    >([])
    const [favorites, setFavorites] = useState<Array<Association<LikeSchema>>>([])
    const [reactions, setReactions] = useState<Array<Association<EmojiAssociationSchema>>>([])
    const [replyTo, setReplyTo] = useState<Message<ReplyMessageSchema> | null>(null)

    const tab = (location.hash.slice(1) as 'replies' | 'reroutes' | 'favorites' | 'reactions') || 'replies'
    const theme = useTheme()
    const isMobileSize = useMediaQuery(theme.breakpoints.down('sm'))

    const [forceUpdate, setForceUpdate] = useState(0) // FIXME: use more elegant way to force update

    useEffect(() => {
        setMessage(null)
        setReplies([])
        setReplyTo(null)

        let isMounted = true
        console.log('loadMessage', messageID, authorID)
        if (!messageID || !authorID) return
        client
            .getMessage<any>(messageID, authorID)
            .then((msg) => {
                if (!isMounted || !msg) return
                setMessage(msg)

                msg.getReplyMessages().then((replies) => {
                    if (!isMounted) return
                    setReplies(replies)
                })

                msg.getRerouteMessages().then((reroutes) => {
                    if (!isMounted) return
                    setReroutes(reroutes)
                })

                msg.getFavorites().then((favorites) => {
                    if (!isMounted) return
                    setFavorites(favorites)
                })

                msg.getReactions().then((reactions) => {
                    if (!isMounted) return
                    setReactions(reactions)
                })

                if (msg.schema === Schemas.replyMessage) {
                    msg.getReplyTo().then((replyTo) => {
                        if (!isMounted) return
                        setReplyTo(replyTo)
                    })
                }
            })
            .finally(() => {
                setIsFetching(false)
            })

        return () => {
            isMounted = false
        }
    }, [messageID, authorID, forceUpdate])

    if (isFetching) {
        return (
            <>
                <Typography>loading...</Typography>
            </>
        )
    }

    if (!message) {
        return (
            <>
                <Typography>Message not found</Typography>
            </>
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflow: 'scroll'
            }}
        >
            <Typography variant="h2" gutterBottom>
                Message
            </Typography>
            <Divider />

            {replyTo && (
                <Paper
                    sx={{
                        padding: '20px'
                    }}
                >
                    <MessageView message={replyTo} lastUpdated={lastUpdated} userCCID={client.ccid} />
                </Paper>
            )}

            {(message.schema === Schemas.simpleNote || message.schema === Schemas.replyMessage) && (
                <Paper
                    sx={{
                        padding: '20px'
                    }}
                >
                    <MessageView
                        forceExpanded
                        message={message as Message<SimpleNoteSchema | ReplyMessageSchema>}
                        lastUpdated={lastUpdated}
                        userCCID={client.ccid}
                    />
                </Paper>
            )}

            <Tabs
                value={tab}
                onChange={(_, next) => {
                    location.hash = next
                }}
                textColor="secondary"
                indicatorColor="secondary"
                variant={isMobileSize ? 'fullWidth' : 'standard'}
            >
                <Tab
                    value="replies"
                    label="Replies"
                    sx={{ fontSize: '0.9rem', padding: '0', textTransform: 'none', minWidth: { xs: '0', sm: '80px' } }}
                />
                <Tab
                    value="reroutes"
                    label="Reroutes"
                    sx={{ fontSize: '0.9rem', padding: '0', textTransform: 'none', minWidth: { xs: '0', sm: '80px' } }}
                />
                <Tab
                    value="favorites"
                    label="Favorites"
                    sx={{ fontSize: '0.9rem', padding: '0', textTransform: 'none', minWidth: { xs: '0', sm: '80px' } }}
                />
                <Tab
                    value="reactions"
                    label="Reactions"
                    sx={{ fontSize: '0.9rem', padding: '0', textTransform: 'none', minWidth: { xs: '0', sm: '80px' } }}
                />
            </Tabs>
            <Divider />
            {tab === 'replies' && (
                <>
                    <Paper variant="outlined">
                        <Draft
                            streamPickerInitial={message.postedStreams ?? []}
                            streamPickerOptions={actions.allKnownStreams}
                            placeholder="Write a reply..."
                            onSubmit={async (text: string, streams: string[], options) => {
                                await message.reply(streams, text, options?.emojis)
                                return null
                            }}
                            sx={{
                                p: 1
                            }}
                        />
                    </Paper>
                    {replies.length > 0 && (
                        <>
                            <Typography variant="h2" gutterBottom>
                                Replies:
                            </Typography>
                            {replies.map(
                                (reply) =>
                                    reply.association &&
                                    reply.message && (
                                        <Paper
                                            key={reply.message.id}
                                            sx={{
                                                padding: '20px'
                                            }}
                                        >
                                            <MessageView
                                                message={reply.message}
                                                lastUpdated={lastUpdated}
                                                userCCID={client.ccid}
                                                additionalMenuItems={
                                                    reply.association.author === client.ccid ||
                                                    reply.association.owner === client.ccid ? (
                                                        <MenuItem
                                                            onClick={() => {
                                                                reply.association?.delete().then(() => {
                                                                    setForceUpdate((prev) => prev + 1)
                                                                })
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                                                            </ListItemIcon>
                                                            <ListItemText>関連付けを削除</ListItemText>
                                                        </MenuItem>
                                                    ) : undefined
                                                }
                                            />
                                        </Paper>
                                    )
                            )}
                        </>
                    )}
                </>
            )}
            {tab === 'reroutes' && (
                <>
                    <Typography variant="h2" gutterBottom>
                        Reroutes:
                    </Typography>
                    {reroutes.length > 0 && (
                        <>
                            {reroutes.map(
                                (reroute) =>
                                    reroute.association &&
                                    reroute.message && (
                                        <Paper
                                            key={reroute.message.id}
                                            sx={{
                                                padding: '20px'
                                            }}
                                        >
                                            <RerouteMessageFrame
                                                message={reroute.message}
                                                additionalMenuItems={
                                                    reroute.association.author === client.ccid ||
                                                    reroute.association.owner === client.ccid ? (
                                                        <MenuItem
                                                            onClick={() => {
                                                                reroute.association?.delete().then(() => {
                                                                    setForceUpdate((prev) => prev + 1)
                                                                })
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                                                            </ListItemIcon>
                                                            <ListItemText>関連付けを削除</ListItemText>
                                                        </MenuItem>
                                                    ) : undefined
                                                }
                                            />
                                        </Paper>
                                    )
                            )}
                        </>
                    )}
                </>
            )}
            {tab === 'favorites' && (
                <>
                    <Typography variant="h2" gutterBottom>
                        Favorites:
                    </Typography>
                    <List>
                        {favorites.map((favorite) => (
                            <FavoriteAssociation key={favorite.id} association={favorite} perspective={client.ccid} />
                        ))}
                    </List>
                </>
            )}
            {tab === 'reactions' && (
                <>
                    <Typography variant="h2" gutterBottom>
                        Reactions:
                    </Typography>
                    <List>
                        {reactions.map((reaction) => (
                            <ReactionAssociation key={reaction.id} association={reaction} perspective={client.ccid} />
                        ))}
                    </List>
                </>
            )}
        </Box>
    )
}
