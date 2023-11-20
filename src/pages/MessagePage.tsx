import { Box, Divider, List, Paper, Tab, Tabs, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useApi } from '../context/api'
import { useEffect, useState } from 'react'
import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema,
    type Association,
    type LikeSchema,
    type EmojiAssociationSchema
} from '@concurrent-world/client'
import { MessageView } from '../components/Message/MessageView'
import { Draft } from '../components/Draft'
import { useGlobalActions } from '../context/GlobalActions'
import { RerouteMessageFrame } from '../components/Message/RerouteMessageFrame'
import { FavoriteAssociation } from '../components/Association/FavoriteAssociation'
import { ReactionAssociation } from '../components/Association/ReactionAssociation'

export function MessagePage(): JSX.Element {
    const { id } = useParams()
    const client = useApi()
    const messageID = id?.split('@')[0]
    const authorID = id?.split('@')[1]
    const lastUpdated = 0

    const actions = useGlobalActions()

    const [message, setMessage] = useState<Message<
        SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const [replies, setReplies] = useState<Array<Message<ReplyMessageSchema>>>([])
    const [reroutes, setReroutes] = useState<Array<Message<RerouteMessageSchema>>>([])
    const [favorites, setFavorites] = useState<Array<Association<LikeSchema>>>([])
    const [reactions, setReactions] = useState<Array<Association<EmojiAssociationSchema>>>([])
    const [replyTo, setReplyTo] = useState<Message<ReplyMessageSchema> | null>(null)

    const tab = (location.hash.slice(1) as 'replies' | 'reroutes' | 'favorites' | 'reactions') || 'replies'

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
    }, [messageID, authorID])

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
            >
                <Tab value="replies" label="Replies" />
                <Tab value="reroutes" label="Reroutes" />
                <Tab value="favorites" label="Favorites" />
                <Tab value="reactions" label="Reactions" />
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
                            {replies.map((reply) => (
                                <Paper
                                    key={reply.id}
                                    sx={{
                                        padding: '20px'
                                    }}
                                >
                                    <MessageView message={reply} lastUpdated={lastUpdated} userCCID={client.ccid} />
                                </Paper>
                            ))}
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
                            {reroutes.map((reroute) => (
                                <Paper
                                    key={reroute.id}
                                    sx={{
                                        padding: '20px'
                                    }}
                                >
                                    <RerouteMessageFrame message={reroute} />
                                </Paper>
                            ))}
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
