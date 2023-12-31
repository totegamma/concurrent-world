import {
    type Association,
    type EmojiAssociationSchema,
    type Message,
    type ReplyMessageSchema,
    type SimpleNoteSchema,
    type User
} from '@concurrent-world/client'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'
import { Box, Link, Typography } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MarkdownRendererLite } from '../ui/MarkdownRendererLite'

export interface ReactionAssociationProps {
    association: Association<EmojiAssociationSchema>
    perspective: string
    withoutContent?: boolean
}

export const ReactionAssociation = (props: ReactionAssociationProps): JSX.Element => {
    const [target, setTarget] = useState<Message<SimpleNoteSchema | ReplyMessageSchema> | null>(null)
    const isMeToOther = props.association?.authorUser?.ccid !== props.perspective

    const Nominative = props.association?.authorUser?.profile?.payload.body.username ?? 'anonymous'
    const Possessive =
        (target?.payload.body.profileOverride?.username ??
            target?.authorUser?.profile?.payload.body.username ??
            'anonymous') + "'s"

    const actionUser: User | undefined = isMeToOther ? props.association.authorUser : target?.authorUser

    useEffect(() => {
        props.association.getTargetMessage().then(setTarget)
    }, [props.association])

    return (
        <ContentWithCCAvatar
            author={actionUser}
            profileOverride={!isMeToOther ? target?.payload.body.profileOverride : undefined}
        >
            <Box display="flex" justifyContent="space-between">
                <Typography>
                    {isMeToOther ? (
                        <>
                            <b>{Nominative}</b> reacted {Possessive} message with{' '}
                            <img
                                height="13px"
                                src={props.association.payload.body.imageUrl}
                                alt={props.association.payload.body.shortcode}
                            />
                        </>
                    ) : (
                        <>
                            {Nominative} reacted <b>{Possessive}</b> message with{' '}
                            <img
                                height="13px"
                                src={props.association.payload.body.imageUrl}
                                alt={props.association.payload.body.shortcode}
                            />
                        </>
                    )}
                </Typography>
                <Link
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    fontSize="0.75rem"
                    to={`/message/${target?.id ?? ''}@${target?.author ?? ''}`}
                >
                    <TimeDiff date={new Date(props.association.cdate)} />
                </Link>
            </Box>
            {(!props.withoutContent && (
                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                    <MarkdownRendererLite
                        messagebody={target?.payload.body.body ?? 'no content'}
                        emojiDict={target?.payload.body.emojis ?? {}}
                    />
                </blockquote>
            )) ||
                undefined}
        </ContentWithCCAvatar>
    )
}
