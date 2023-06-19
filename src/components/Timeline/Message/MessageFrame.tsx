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
import { ThinMessageView } from './ThinMessageView'
import { useMessageDetail } from '../../../context/MessageDetail'

export interface MessageFrameProp {
    message: CCMessage<any>
    lastUpdated: number
    thin?: boolean
}

export const MessageFrame = memo<MessageFrameProp>((props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const [fetchSuccess, setFetchSucceed] = useState<boolean>(true)

    useEffect(() => {
        setMessage(props.message)
        Promise.all(props.message.streams.map(async (id) => await api.readStream(id))).then((e) => {
            setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        })
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

    const unfavorite = useCallback(async (deletekey: string | undefined, author: CCID): Promise<void> => {
        if (!deletekey) return
        await api.unFavoriteMessage(deletekey, author)
    }, [])

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
            {props.thin ? (
                <ThinMessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {}}
                    handleReply={async () => {}}
                    unfavorite={() => {}}
                    favorite={async () => {}}
                    setMessageAnchor={setMessageAnchor}
                    setFetchSucceed={setFetchSucceed}
                />
            ) : (
                <MessageView
                    message={message}
                    author={author}
                    reactUsers={reactUsers}
                    theme={theme}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    api={api}
                    inspectHandler={() => {
                        inspector.inspectItem({ messageId: message.id, author: message.author })
                    }}
                    handleReply={async () => {
                        messageDetail.showMessage({ messageId: message?.id || '', author: message?.author || '' })
                    }}
                    unfavorite={() => {
                        unfavorite(message.associations.find((e) => e.author === api.userAddress)?.id, message.author)
                    }}
                    favorite={() => api.favoriteMessage(props.message.id, props.message.author)}
                    setMessageAnchor={setMessageAnchor}
                    setFetchSucceed={setFetchSucceed}
                />
            )}
        </>
    )
})

MessageFrame.displayName = 'MessageFrame'
