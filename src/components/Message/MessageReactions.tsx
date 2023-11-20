import { Box, Button, Divider, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { useMemo, useState } from 'react'
import { Link as routerLink } from 'react-router-dom'

import {
    type Association,
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type SimpleNoteSchema
} from '@concurrent-world/client'
import { type EmojiAssociation } from '@concurrent-world/client/dist/types/schemas/emojiAssociation'

export interface MessageReactionsProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema>
}

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const theme = useTheme()

    const [reactionMembers, setReactionMembers] = useState<Record<string, Array<Association<EmojiAssociation>>>>({})

    const ownReactions = useMemo(
        () =>
            Object.fromEntries(
                props.message.ownAssociations
                    .filter((association) => association.schema === Schemas.emojiAssociation)
                    .map((association) => [association.payload.body.imageUrl, association])
            ),
        [props.message]
    )

    const loadReactionMembers = (reaction: string): void => {
        props.message.getReactions(reaction).then((reactions) => {
            setReactionMembers((prev) => {
                return {
                    ...prev,
                    [reaction]: reactions
                }
            })
        })
    }

    if (!props.message.reactionCounts || Object.keys(props.message.reactionCounts).length === 0) {
        return <></>
    }

    return (
        <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(props.message.reactionCounts).map(([imageUrl, value]) => (
                <Tooltip
                    arrow
                    key={imageUrl}
                    title={
                        <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box component="img" height="20px" src={imageUrl}></Box>
                                {reactionMembers[imageUrl]?.[0].payload.body.shortcode ?? 'Loading...'}
                            </Box>
                            <Divider flexItem></Divider>
                            {reactionMembers[imageUrl]?.map((reaction) => (
                                <Box
                                    key={reaction.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none'
                                    }}
                                    component={routerLink}
                                    to={reaction.payload.body.profileOverride?.link ?? '/entity/' + reaction.author}
                                    target={reaction.payload.body.profileOverride?.link ? '_blank' : undefined}
                                    rel={
                                        reaction.payload.body.profileOverride?.link ? 'noopener noreferrer' : undefined
                                    }
                                >
                                    <CCAvatar
                                        avatarURL={
                                            reaction.payload.body.profileOverride?.avatar ??
                                            reaction.authorUser?.profile?.payload.body.avatar
                                        }
                                        identiconSource={reaction.author}
                                        sx={{
                                            width: { xs: '12px', sm: '18px' },
                                            height: { xs: '12px', sm: '18px' }
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '0.8rem',
                                            color: '#fff'
                                        }}
                                    >
                                        {reaction.payload.body.profileOverride?.username ||
                                            reaction.authorUser?.profile?.payload.body.username ||
                                            'anonymous'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    }
                    placement="top"
                    onOpen={() => {
                        loadReactionMembers(imageUrl)
                    }}
                >
                    <Button
                        sx={{
                            p: 0,
                            gap: 1,
                            display: 'flex',
                            backgroundColor: ownReactions[imageUrl]
                                ? alpha(theme.palette.primary.main, 0.5)
                                : 'transparent',
                            borderColor: theme.palette.primary.main
                        }}
                        variant="outlined"
                        onClick={() => {
                            if (ownReactions[imageUrl]) {
                                props.message.deleteAssociation(ownReactions[imageUrl].id)
                            } else {
                                if (reactionMembers[imageUrl]) {
                                    const shortcode = reactionMembers[imageUrl]?.[0].payload.body.shortcode
                                    props.message.reaction(shortcode, imageUrl)
                                } else {
                                    props.message.getReactions(imageUrl).then((reactions) => {
                                        const shortcode = reactions[0].payload.body.shortcode
                                        props.message.reaction(shortcode, imageUrl)
                                    })
                                }
                            }
                        }}
                    >
                        <Box component="img" height="20px" src={imageUrl} />
                        <Typography color={ownReactions[imageUrl] ? 'primary.contrastText' : 'text.primary'}>
                            {value}
                        </Typography>
                    </Button>
                </Tooltip>
            ))}
        </Box>
    )
}
