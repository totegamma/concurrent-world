import {
    type Association,
    type ReactionAssociationSchema,
    type Message,
    type ReplyMessageSchema,
    type MarkdownMessageSchema,
    type User
} from '@concurrent-world/client'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'
import { Box, Link, Typography } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { type ReactElement, useEffect, useState } from 'react'

export interface MentionAssociationProps {
    association: Association<ReactionAssociationSchema>
    perspective: string
    withoutContent?: boolean
}

export const MentionAssociation = (props: MentionAssociationProps): ReactElement => {
    const [target, setTarget] = useState<Message<MarkdownMessageSchema | ReplyMessageSchema> | null>(null)
    const isMeToOther = props.association?.authorUser?.ccid !== props.perspective

    const Nominative = props.association?.authorUser?.profile?.username ?? 'anonymous'
    const Possessive =
        (target?.document.body.profileOverride?.username ?? target?.authorUser?.profile?.username ?? 'anonymous') + "'s"

    const actionUser: User | undefined = isMeToOther ? props.association.authorUser : target?.authorUser

    useEffect(() => {
        props.association.getTargetMessage().then(setTarget)
    }, [props.association])

    return (
        <ContentWithCCAvatar
            author={actionUser}
            profileOverride={!isMeToOther ? target?.document.body.profileOverride : undefined}
        >
            <Box display="flex" justifyContent="space-between">
                <Typography>
                    {isMeToOther ? (
                        <>
                            <b>{Nominative}</b> mentioned You in message with{' '}
                            <img
                                height="13px"
                                src={props.association.document.body.imageUrl}
                                alt={props.association.document.body.shortcode}
                            />
                        </>
                    ) : (
                        <>
                            {Nominative} mentioned You in message with{' '}
                            <img
                                height="13px"
                                src={props.association.document.body.imageUrl}
                                alt={props.association.document.body.shortcode}
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
                    {target?.document.body.body}
                </blockquote>
            )) ||
                undefined}
        </ContentWithCCAvatar>
    )
}
