import { Box, Button, Divider, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import { CCAvatar } from '../ui/CCAvatar'
import { useState } from 'react'
import { Link as routerLink } from 'react-router-dom'

import { Association, Message, ReplyMessageSchema, RerouteMessageSchema, SimpleNoteSchema } from '@concurrent-world/client'
import { EmojiAssociation } from '@concurrent-world/client/dist/types/schemas/emojiAssociation'

export interface MessageReactionsProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema>
}

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const theme = useTheme()
    const ownReaction = false

    const [reactionMembers, setReactionMembers] = useState<Record<string, Association<EmojiAssociation>[]>>({})

    if (!props.message.reactionCounts) {
        return <></>
    }

    const loadReactionMembers = (reaction: string) => {
        props.message.getReactions(reaction).then((reactions) => {
            setReactionMembers((prev) => {
                return {
                    ...prev,
                    [reaction]: reactions
                }
            })
        })
    }

    return (
        <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(props.message.reactionCounts).map(([key, value]) => 
                <Tooltip
                    arrow
                    key={key}
                    title={
                        <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box component="img" height="20px" src={key}></Box>
                                {reactionMembers[key] ? reactionMembers[key][0].payload.body.shortcode : "Loading..."}
                            </Box>
                            <Divider flexItem></Divider>
                            {
                                reactionMembers[key]?.map((reaction) => (
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
                                        rel={reaction.payload.body.profileOverride?.link ? 'noopener noreferrer' : undefined}
                                    >
                                        <CCAvatar
                                            avatarURL={reaction.authorUser?.profile?.payload.body.avatar}
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
                                        {reaction.authorUser?.profile?.payload.body.username}</Typography>
                                    </Box>
                                ))
                            }
                        </Box>
                    }
                    placement="top"
                    onOpen={() => loadReactionMembers(key)}
                >
                    <Button
                        sx={{
                            p: 0,
                            gap: 1,
                            display: 'flex',
                            backgroundColor: ownReaction ? alpha(theme.palette.primary.main, 0.5) : 'transparent',
                            borderColor: theme.palette.primary.main
                        }}
                        variant="outlined"
                        onClick={() => {
                        }}
                    >
                        <Box component="img" height="20px" src={key} />
                        <Typography color={ownReaction ? 'primary.contrastText' : 'text.primary'}>
                            {value}
                        </Typography>
                    </Button>
                </Tooltip>
            )}
        </Box>
    )
}
