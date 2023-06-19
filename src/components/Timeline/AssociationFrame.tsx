import { memo, useCallback, useContext, useEffect, useState } from 'react'
import type { Association, Character, Message, StreamElement, CCID, ProfileWithAddress } from '../../model'
import { useApi } from '../../context/api'
import { Schemas } from '../../schemas'
import { Box, IconButton, ListItem, Typography, useTheme } from '@mui/material'
import type { Profile } from '../../schemas/profile'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../CCAvatar'
import { MessageFrame } from './Message/MessageFrame'
import { MessageView } from './Message/MessageView'
import { useInspector } from '../../context/Inspector'
import { type Like } from '../../schemas/like'
import { ApplicationContext } from '../../App'
import { useMessageDetail } from '../../context/MessageDetail'

export interface AssociationFrameProp {
    association: StreamElement
    lastUpdated: number
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element => {
    const api = useApi()
    const theme = useTheme()
    const inspector = useInspector()
    const appData = useContext(ApplicationContext)
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [association, setAssociation] = useState<Association<any> | undefined>()

    const [replyMessage, setReplyMessage] = useState<Message<any> | undefined>()
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)

    const isMeToOther = association?.author !== api.userAddress

    // TODO いずれ消す
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    useEffect(() => {
        api.fetchAssociation(props.association.id, props.association.currenthost).then((a) => {
            if (!a) return
            setAssociation(a)

            if (a?.schema === Schemas.replyAssociation) {
                console.log('as', a.payload.body)

                api.fetchMessageWithAuthor(a.payload.body.messageId, a.author).then((m) => {
                    setMessage(m)
                })

                api.fetchMessageWithAuthor(a.targetID, a.payload.body.messageAuthor).then((m) => {
                    setReplyMessage(m)
                })

                api.readCharacter(a.payload.body.messageAuthor, Schemas.profile).then((author) => {
                    setAuthor(author)
                })

                return
            }

            api.fetchMessage(a.targetID, props.association.currenthost).then((m) => {
                setMessage(m)
                if (!m) return
                const isMeToOther = a.author !== api.userAddress
                api.readCharacter(isMeToOther ? props.association.author : m.author, Schemas.profile).then((author) => {
                    setAuthor(author)
                })
            })
        })
    }, [])

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

    const favorite = useCallback(
        async ({ id, author }: { id: string; author: CCID }): Promise<void> => {
            const authorInbox = (await api.readCharacter(author, Schemas.userstreams))?.payload.body.notificationStream
            console.log(authorInbox)
            const targetStream = [authorInbox, appData.userstreams?.payload.body.associationStream].filter(
                (e) => e
            ) as string[]

            console.log(targetStream)

            api.createAssociation<Like>(Schemas.like, {}, id, author, 'messages', targetStream).then((_) => {
                api.invalidateMessage(id)
                // MEMO 無理やり更新
                console.log(association?.payload.body)
                api.fetchMessageWithAuthor(association?.payload.body.messageId, association?.author ?? '').then((m) => {
                    setMessage(m)
                })
            })
        },
        [association]
    )

    const unfavorite = useCallback(
        (deletekey: string | undefined, author: string): void => {
            if (!deletekey) return
            api.deleteAssociation(deletekey, author).then((_) => {
                api.invalidateMessage(association?.payload.body.messageId)
                // MEMO 無理やり更新
                console.log(association?.payload.body)
                api.fetchMessageWithAuthor(association?.payload.body.messageId, association?.author ?? '').then((m) => {
                    setMessage(m)
                })
            })
        },
        [association]
    )

    if (!association) {
        return (
            <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                    404 not found
                </Typography>
            </ListItem>
        )
    }

    return (
        <>
            {association.schema === Schemas.like && (
                <ListItem
                    sx={{
                        alignItems: 'flex-start',
                        flex: 1,
                        p: { xs: '7px 0', sm: '10px 0' },
                        wordBreak: 'break-word'
                    }}
                >
                    <Box
                        sx={{
                            padding: {
                                xs: '5px 8px 0 0',
                                sm: '8px 10px 0 0'
                            }
                        }}
                    >
                        <IconButton
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' }
                            }}
                            component={routerLink}
                            to={'/entity/' + association.author}
                        >
                            <CCAvatar
                                alt={author?.payload.body.username}
                                avatarURL={author?.payload.body.avatar}
                                identiconSource={association.author}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
                                }}
                            />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <Typography>
                            {isMeToOther ? (
                                <>
                                    <b>{author?.payload.body.username}</b> favorited your message
                                </>
                            ) : (
                                <>
                                    You favorited <b>{author?.payload.body.username}</b>&apos;s message
                                </>
                            )}
                        </Typography>
                        <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                            {message?.payload.body.body}
                        </blockquote>
                    </Box>
                </ListItem>
            )}

            {association.schema === Schemas.replyAssociation && (
                <>
                    {replyMessage && <MessageFrame message={replyMessage} lastUpdated={1} thin={true}></MessageFrame>}
                    <Box
                        sx={{
                            paddingLeft: 2
                        }}
                    >
                        <Typography variant="caption" color="text.disabled">
                            {' '}
                            {author?.payload.body.username || 'Anonymous'} さんが返信{' '}
                        </Typography>
                        {message && (
                            <MessageView
                                message={message}
                                author={author}
                                reactUsers={reactUsers}
                                theme={theme}
                                hasOwnReaction={hasOwnReaction}
                                msgstreams={[]}
                                messageAnchor={messageAnchor}
                                api={api}
                                inspectHandler={() => {
                                    inspector.inspectItem({ messageId: message.id, author: message.author })
                                }}
                                handleReply={async () => {
                                    messageDetail.showMessage({
                                        messageId: message?.id || '',
                                        author: message?.author || ''
                                    })
                                }}
                                unfavorite={() => {
                                    unfavorite(
                                        message.associations.find((e) => e.author === api.userAddress)?.id,
                                        message.author
                                    )
                                }}
                                favorite={() => favorite({ ...message })}
                                setMessageAnchor={setMessageAnchor}
                                setFetchSucceed={() => {
                                    return true
                                }}
                            />
                        )}
                    </Box>
                </>
            )}
        </>
    )
})

AssociationFrame.displayName = 'AssociationFrame'
