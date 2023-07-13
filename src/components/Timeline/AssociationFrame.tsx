import { memo, useEffect, useState } from 'react'
import type { Association, Character, Message, StreamElement } from '../../model'
import { useApi } from '../../context/api'
import { Schemas } from '../../schemas'
import { Box, IconButton, ListItem, ListItemButton, Typography } from '@mui/material'
import type { Profile } from '../../schemas/profile'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../CCAvatar'
import { MessageSkeleton } from '../MessageSkeleton'
import { MessageContainer } from './MessageContainer'

export interface AssociationFrameProp {
    association: StreamElement
    lastUpdated: number
    after: JSX.Element | undefined
    perspective?: string
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element | null => {
    const api = useApi()
    const [associationAuthor, setAssociationAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [messageAuthor, setMessageAuthor] = useState<Character<Profile> | undefined>()
    const [association, setAssociation] = useState<Association<any> | undefined>()
    const [fetching, setFetching] = useState<boolean>(true)

    const perspective = props.perspective ?? api.userAddress
    const isMeToOther = association?.author !== perspective

    const Nominative = perspective === api.userAddress ? 'You' : associationAuthor?.payload.body.username ?? 'anonymous'
    const Possessive =
        perspective === api.userAddress ? 'your' : (messageAuthor?.payload.body.username ?? 'anonymous') + "'s"

    const actionUser = isMeToOther ? associationAuthor : messageAuthor

    useEffect(() => {
        api.fetchAssociation(props.association.id, props.association.currenthost)
            .then((a) => {
                if (!a) return
                setAssociation(a)
                api.fetchMessage(a.targetID, props.association.currenthost).then((m) => {
                    setMessage(m)
                    if (!m) return
                    api.readCharacter(a.author, Schemas.profile).then((author) => {
                        setAssociationAuthor(author)
                    })
                    api.readCharacter(m.author, Schemas.profile).then((author) => {
                        setMessageAuthor(author)
                    })
                })
            })
            .catch((_e) => {
                setAssociation(undefined)
            })
            .finally(() => {
                setFetching(false)
            })
    }, [])

    if (fetching) return <MessageSkeleton />
    if (!association) return null

    switch (association.schema) {
        case Schemas.like:
            return (
                <>
                    <ListItem
                        sx={{
                            alignItems: 'flex-start',
                            wordBreak: 'break-word'
                        }}
                        disablePadding
                    >
                        <ListItemButton
                            disableGutters
                            component={routerLink}
                            to={`/message/${message?.id ?? ''}@${message?.author ?? ''}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flex: 1,
                                gap: 2
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' },
                                    mt: { xs: '3px', sm: '5px' }
                                }}
                                component={routerLink}
                                to={'/entity/' + association.author}
                            >
                                <CCAvatar
                                    alt={actionUser?.payload.body.username}
                                    avatarURL={actionUser?.payload.body.avatar}
                                    identiconSource={actionUser?.id ?? ''}
                                    sx={{
                                        width: { xs: '38px', sm: '48px' },
                                        height: { xs: '38px', sm: '48px' }
                                    }}
                                />
                            </IconButton>
                            <Box
                                sx={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    width: '100%',
                                    overflow: 'auto',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{associationAuthor?.payload.body.username ?? 'anonymous'}</b> favorited{' '}
                                            {Possessive} message
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} favorited{' '}
                                            <b>{messageAuthor?.payload.body.username ?? 'anonymous'}</b>&apos;s message
                                        </>
                                    )}
                                </Typography>
                                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                    {message?.payload.body.body}
                                </blockquote>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                    {props.after}
                </>
            )
        case Schemas.emojiAssociation:
            return (
                <>
                    <ListItem
                        sx={{
                            alignItems: 'flex-start',
                            wordBreak: 'break-word'
                        }}
                        disablePadding
                    >
                        <ListItemButton
                            disableGutters
                            component={routerLink}
                            to={`/message/${message?.id ?? ''}@${message?.author ?? ''}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flex: 1,
                                gap: 2
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' },
                                    mt: { xs: '3px', sm: '5px' }
                                }}
                                component={routerLink}
                                to={'/entity/' + association.author}
                            >
                                <CCAvatar
                                    alt={actionUser?.payload.body.username}
                                    avatarURL={actionUser?.payload.body.avatar}
                                    identiconSource={actionUser?.id ?? ''}
                                    sx={{
                                        width: { xs: '38px', sm: '48px' },
                                        height: { xs: '38px', sm: '48px' }
                                    }}
                                />
                            </IconButton>
                            <Box
                                sx={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    width: '100%',
                                    overflow: 'auto',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{associationAuthor?.payload.body.username ?? 'anonymous'}</b> reacted{' '}
                                            {Possessive} message with{' '}
                                            <img
                                                height="13px"
                                                src={association?.payload.body.imageUrl}
                                                alt={association?.payload.body.shortcode}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} reacted{' '}
                                            <b>{messageAuthor?.payload.body.username ?? 'anonymous'}</b>&apos;s message
                                            with{' '}
                                            <img
                                                height="13px"
                                                src={association?.payload.body.imageUrl}
                                                alt={association?.payload.body.shortcode}
                                            />
                                        </>
                                    )}
                                </Typography>
                                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                    {message?.payload.body.body}
                                </blockquote>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                    {props.after}
                </>
            )
        case Schemas.replyAssociation:
            return (
                <MessageContainer
                    messageID={association.payload.body.messageId}
                    messageOwner={association.author}
                    after={props.after}
                />
            )
        case Schemas.reRouteAssociation:
            return (
                <MessageContainer
                    messageID={association.payload.body.messageId}
                    messageOwner={association.payload.body.messageAuthor}
                    after={props.after}
                />
            )
        default:
            return (
                <>
                    <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">
                            Unknown association schema
                        </Typography>
                    </ListItem>
                    {props.after}
                </>
            )
    }
})

AssociationFrame.displayName = 'AssociationFrame'
