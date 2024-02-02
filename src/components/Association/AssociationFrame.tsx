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
import { Box, ListItem, type SxProps, Typography } from '@mui/material'
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
    sx?: SxProps
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
        return <></>
    }

    switch (association.schema) {
        case Schemas.like:
            return (
                <Box sx={props.sx}>
                    <FavoriteAssociation
                        association={association as Association<LikeSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
                    {props.after}
                </Box>
            )
        case Schemas.emojiAssociation:
            return (
                <Box sx={props.sx}>
                    <ReactionAssociation
                        association={association as Association<EmojiAssociationSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
                    {props.after}
                </Box>
            )
        case Schemas.replyAssociation:
            return (
                <Box sx={props.sx}>
                    <MessageContainer
                        messageID={(association as Association<ReplyAssociationSchema>).payload.body.messageId}
                        messageOwner={(association as Association<ReplyAssociationSchema>).payload.body.messageAuthor}
                        after={props.after}
                    />
                </Box>
            )
        case Schemas.rerouteAssociation:
            return (
                <Box sx={props.sx}>
                    <MessageContainer
                        messageID={(association as Association<RerouteAssociationSchema>).payload.body.messageId}
                        messageOwner={(association as Association<ReplyAssociationSchema>).payload.body.messageAuthor}
                        after={props.after}
                    />
                </Box>
            )
        case Schemas.mention:
            return (
                <Box sx={props.sx}>
                    <MentionAssociation
                        association={association as Association<EmojiAssociationSchema>}
                        perspective={props.perspective ?? client.ccid ?? ''}
                    />
                    {props.after}
                </Box>
            )
        default:
            return (
                <Box sx={props.sx}>
                    <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">
                            Unknown association schema
                        </Typography>
                    </ListItem>
                    {props.after}
                </Box>
            )
    }
})

AssociationFrame.displayName = 'AssociationFrame'
