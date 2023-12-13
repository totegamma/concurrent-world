import { memo, useEffect, useState } from 'react'
import {
    type Association,
    type EmojiAssociationSchema,
    type LikeSchema,
    type ReplyAssociationSchema,
    type RerouteAssociationSchema,
    Schemas
} from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { ListItem, Typography } from '@mui/material'
import { MessageSkeleton } from '../MessageSkeleton'
import { MessageContainer } from '../Message/MessageContainer'
import { usePreference } from '../../context/PreferenceContext'
import { FavoriteAssociation } from './FavoriteAssociation'
import { ReactionAssociation } from './ReactionAssociation'
import { MentionAssociation } from './MentionAssociation'

export interface AssociationFrameProp {
    associationID: string
    associationOwner: string
    lastUpdated: number
    after: JSX.Element | undefined
    perspective?: string
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element | null => {
    const client = useApi()
    const [isDevMode] = usePreference('devMode')
    const [association, setAssociation] = useState<Association<
        LikeSchema | EmojiAssociationSchema | ReplyAssociationSchema | RerouteAssociationSchema
    > | null>(null)
    const [fetching, setFetching] = useState<boolean>(true)

    useEffect(() => {
        client
            .getAssociation<LikeSchema | EmojiAssociationSchema | ReplyAssociationSchema | RerouteAssociationSchema>(
                props.associationID,
                props.associationOwner
            )
            .then((a) => {
                setAssociation(a ?? null)
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
        if (isDevMode) {
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
                    <FavoriteAssociation
                        association={association as Association<LikeSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
                    {props.after}
                </>
            )
        case Schemas.emojiAssociation:
            return (
                <>
                    <ReactionAssociation
                        association={association as Association<EmojiAssociationSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
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
        case Schemas.mention:
            return (
                <>
                    <MentionAssociation
                        association={association as Association<EmojiAssociationSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
                    {props.after}
                </>
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
