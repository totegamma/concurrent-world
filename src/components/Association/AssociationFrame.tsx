import { memo, useEffect, useState } from 'react'
import {
    Association,
    EmojiAssociationSchema,
    LikeSchema,
    Message,
    ReplyAssociationSchema,
    ReplyMessageSchema,
    RerouteAssociationSchema,
    Schemas,
    SimpleNoteSchema,
    User,
} from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { Box, IconButton, Link, ListItem, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { CCAvatar } from '../ui/CCAvatar'
import { MessageSkeleton } from '../MessageSkeleton'
import { MessageContainer } from '../Message/MessageContainer'
import { TimeDiff } from '../ui/TimeDiff'
import { usePreference } from '../../context/PreferenceContext'

export interface AssociationFrameProp {
    associationID: string
    associationOwner: string
    lastUpdated: number
    after: JSX.Element | undefined
    perspective?: string
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element | null => {
    const client = useApi()
    const pref = usePreference()
    const [association, setAssociation] = useState<Association<LikeSchema | EmojiAssociationSchema | ReplyAssociationSchema | RerouteAssociationSchema> | null>(null)
    const [target, setTarget] = useState<Message<SimpleNoteSchema | ReplyMessageSchema> | null>(null)
    const [fetching, setFetching] = useState<boolean>(true)

    const perspective = props.perspective ?? client.ccid
    const isMeToOther = association?.authorUser?.ccid !== perspective

    const Nominative = perspective === client.ccid ? 'You' : association?.authorUser?.profile?.payload.body.username ?? 'anonymous'
    const Possessive =
        perspective === client.ccid ? 'your' : (target?.authorUser?.profile?.payload.body.username ?? 'anonymous') + "'s"

    const actionUser: User | undefined = isMeToOther ? association?.authorUser : target?.authorUser

    useEffect(() => {
        client
            .getAssociation<LikeSchema | EmojiAssociationSchema | ReplyAssociationSchema | RerouteAssociationSchema>(props.associationID, props.associationOwner)
            .then((a) => {
                setAssociation(a ?? null)
                a?.getTargetMessage().then((m) => {
                    setTarget(m ?? null)
                })
            })
            .catch((e) => {
                console.warn(e)
            })
            .finally(() => {
                setFetching(false)
            })
    }, [props.associationID, props.associationOwner, props.lastUpdated])

    if (fetching) return <MessageSkeleton />
    if (!association) {
        if (pref?.devMode) {
            return (
                <>
                    <Typography>Association not found</Typography>
                    {props.associationID}@{props.associationOwner}
                    {props.after}
                </>
            )
        }
        return null
    }

    switch (association.schema) {
        case Schemas.like:
            return (
                <>
                    <ListItem
                        sx={{
                            alignItems: 'flex-start',
                            wordBreak: 'break-word',
                            gap: 2
                        }}
                        disablePadding
                    >
                        <IconButton
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' },
                                mt: { xs: '3px', sm: '5px' }
                            }}
                            component={RouterLink}
                            to={'/entity/' + (association.author ?? '')}
                        >
                            <CCAvatar
                                avatarURL={actionUser?.profile?.payload.body.avatar}
                                identiconSource={actionUser?.ccid ?? ''}
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
                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{association.authorUser?.profile?.payload.body.username ?? 'anonymous'}</b> favorited{' '}
                                            {Possessive} message
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} favorited{' '}
                                            <b>{target?.authorUser?.profile?.payload.body.username ?? 'anonymous'}</b>&apos;s
                                            message
                                        </>
                                    )}
                                </Typography>
                                <Link
                                    component={RouterLink}
                                    underline="hover"
                                    color="inherit"
                                    fontSize="0.75rem"
                                    to={`/message/${target?.id ?? ''}@${
                                        target?.author ?? ''
                                    }`}
                                >
                                    <TimeDiff date={new Date(association.cdate)} />
                                </Link>
                            </Box>
                            <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                {target?.payload.body.body}
                            </blockquote>
                        </Box>
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
                            wordBreak: 'break-word',
                            gap: 2
                        }}
                        disablePadding
                    >
                        <IconButton
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' },
                                mt: { xs: '3px', sm: '5px' }
                            }}
                            component={RouterLink}
                            to={'/entity/' + (actionUser?.ccid ?? '')}
                        >
                            <CCAvatar
                                avatarURL={actionUser?.profile?.payload.body.avatar}
                                identiconSource={actionUser?.ccid ?? ''}
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
                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{association.authorUser?.profile?.payload.body.username ?? 'anonymous'}</b> reacted{' '}
                                            {Possessive} message with{' '}
                                            <img
                                                height="13px"
                                                src={(association as Association<EmojiAssociationSchema>).payload.body.imageUrl}
                                                alt={(association as Association<EmojiAssociationSchema>).payload.body.shortcode}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} reacted{' '}
                                            <b>{target?.authorUser?.profile?.payload.body.username ?? 'anonymous'}</b>&apos;s
                                            message with{' '}
                                            <img
                                                height="13px"
                                                src={(association as Association<EmojiAssociationSchema>).payload.body.imageUrl}
                                                alt={(association as Association<EmojiAssociationSchema>).payload.body.shortcode}
                                            />
                                        </>
                                    )}
                                </Typography>
                                <Link
                                    component={RouterLink}
                                    underline="hover"
                                    color="inherit"
                                    fontSize="0.75rem"
                                    to={`/message/${target?.id ?? ''}@${
                                        target?.author ?? ''
                                    }`}
                                >
                                    <TimeDiff date={new Date(association.cdate)} />
                                </Link>
                            </Box>
                            <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                {target?.payload.body.body}
                            </blockquote>
                        </Box>
                    </ListItem>
                    {props.after}
                </>
            )
        case Schemas.replyAssociation:
            return (
                <MessageContainer
                    messageID={(association as Association<ReplyAssociationSchema>).payload.body.messageId}
                    messageOwner={(association as Association<ReplyAssociationSchema>).payload.body.messageAuthor}
                    after={props.after}
                />
            )
        case Schemas.rerouteAssociation:
            return (
                <MessageContainer
                    messageID={(association as Association<RerouteAssociationSchema>).payload.body.messageId}
                    messageOwner={(association as Association<ReplyAssociationSchema>).payload.body.messageAuthor}
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
