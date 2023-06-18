import { useState, useEffect, useCallback, memo, useContext } from 'react'
import {
    ListItem,
    Box,
    Typography,
    Link,
    IconButton,
    useTheme,
    Tooltip,
    Skeleton,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon
} from '@mui/material'

import type { Character, Message as CCMessage, ProfileWithAddress, StreamElement, Stream, CCID } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import type { Like } from '../../../schemas/like'
import { useApi } from '../../../context/api'
import { useInspector } from '../../../context/Inspector'
import { ApplicationContext } from '../../../App'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import type { ReplyAssociation } from '../../../schemas/replyAssociation'
import { MessageView } from './MessageView'

export interface MessageFrameProp {
    message: CCMessage<any>
    lastUpdated: number
}

export const MessageFrame = memo<MessageFrameProp>((props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const appData = useContext(ApplicationContext)
    const inspector = useInspector()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [msgstreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const [fetchSuccess, setFetchSucceed] = useState<boolean>(true)

    useEffect(() => {
        // api.fetchMessage(props.message.id, props.message.currenthost)
        //     .then((msg) => {
        //         if (!msg) return
        //         setMessage(msg)
        //         Promise.all(msg.streams.map(async (id) => await api.readStream(id))).then((e) => {
        //             setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        //         })
        //     })
        //     .catch((error) => {
        //         console.log(error)
        //         setFetchSucceed(false)
        //     })

        setMessage(props.message)

        api.readCharacter(props.message.author, Schemas.profile)
            .then((author) => {
                setAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [props.message, props.lastUpdated])

    useEffect(() => {
        const fetchUsers = async (): Promise<any> => {
            const authors = message?.associations.filter((e) => e.schema === Schemas.like).map((m) => m.author) ?? []

            if (
                message?.associations
                    .filter((a) => a.schema === Schemas.like)
                    .find((e) => e.author === api.userAddress) != null
            ) {
                setHasOwnReaction(true)
            } else {
                setHasOwnReaction(false)
            }
            const users = await Promise.all(
                authors.map((ccaddress) =>
                    api.readCharacter(ccaddress, Schemas.profile).then((e) => {
                        return {
                            ccaddress,
                            ...e?.payload.body
                        }
                    })
                )
            )
            setReactUsers(users)
        }

        fetchUsers()
    }, [message?.associations])

    const favorite = useCallback(async ({ id, author }: { id: string; author: string }): Promise<void> => {
        const authorInbox = (await api.readCharacter(author, Schemas.userstreams))?.payload.body.notificationStream
        console.log(authorInbox)
        const targetStream = [appData.userstreams?.payload.body.associationStream].filter((e) => e) as string[]

        console.log(targetStream)

        api.createAssociation<Like>(Schemas.like, {}, id, author, 'messages', targetStream).then((_) => {
            api.invalidateMessage(id)
        })
    }, [])

    const unfavorite = useCallback((deletekey: string | undefined, author: CCID): void => {
        if (!deletekey) return
        api.deleteAssociation(deletekey, author).then((_) => {
            api.invalidateMessage(props.message.id)
        })
    }, [])

    const handleReply = async (): Promise<void> => {
        console.log('messageId', message?.id)
        const data = await api?.createMessage<ReplyMessage>(
            Schemas.replyMessage,
            {
                replyToMessageId: message?.id || '',
                replyToMessageAuthor: message?.author || '',
                body: 'このメッセージは素晴らしいですね ' + Math.floor(Math.random() * 1000).toString()
            },
            message?.streams || []
        )

        const authorInbox = (await api.readCharacter(message?.author || '', Schemas.userstreams))?.payload.body
            .notificationStream
        const targetStream = [authorInbox, appData.userstreams?.payload.body.associationStream].filter(
            (e) => e
        ) as string[]

        console.log('assosiation', targetStream)

        await api?.createAssociation<ReplyAssociation>(
            Schemas.replyAssociation,
            { messageId: data.content.id, messageAuthor: api.userAddress },
            message?.id || '',
            message?.author || '',
            'messages',
            targetStream || []
        )
    }

    if (!fetchSuccess) {
        return (
            <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                    404 not found
                </Typography>
            </ListItem>
        )
    }

    if (!message?.payload?.body) {
        return (
            <ListItem
                sx={{
                    alignItems: 'flex-start',
                    flex: 1,
                    p: { xs: '7px 0', sm: '10px 0' },
                    height: 105,
                    gap: '10px'
                }}
            >
                <Skeleton animation="wave" variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton animation="wave" />
                    <Skeleton animation="wave" height={80} />
                </Box>
            </ListItem>
        )
    }

    return (
        <>
            <MessageView
                message={message}
                author={author}
                reactUsers={reactUsers}
                theme={theme}
                hasOwnReaction={hasOwnReaction}
                msgstreams={msgstreams}
                messageAnchor={messageAnchor}
                api={api}
                inspectHandler={() => {
                    inspector.inspectItem({ messageId: message.id, author: message.author })
                }}
                handleReply={handleReply}
                unfavorite={() => {
                    unfavorite(message.associations.find((e) => e.author === api.userAddress)?.id, message.author)
                }}
                favorite={() => favorite({ ...props.message })}
                setMessageAnchor={setMessageAnchor}
                setFetchSucceed={setFetchSucceed}
            />
        </>
    )
})

MessageFrame.displayName = 'MessageFrame'
