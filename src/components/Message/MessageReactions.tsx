import { Box, Button, Divider, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import { useApi } from '../../context/api'
import { CCAvatar } from '../ui/CCAvatar'
import { Fragment } from 'react'
import { useMessageService } from './MessageContainer'
import { Link as routerLink } from 'react-router-dom'

import { type M_Reply, type M_Current, type M_Reroute, type A_Reaction } from '@concurrent-world/client'

export interface MessageReactionsProps {
    message: M_Current | M_Reply | M_Reroute
}

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()
    const service = useMessageService()

    const filteredReactions = props.message.reactions.reduce((acc: Record<string, A_Reaction[]>, cur) => {
        if (cur.imageUrl in acc) {
            acc[cur.imageUrl].push(cur)
        } else {
            acc[cur.imageUrl] = [cur]
        }
        return acc
    }, {})

    return (
        <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(filteredReactions).map((r) => {
                const [key, reactions]: [string, A_Reaction[]] = r
                const ownReaction = reactions.find((x) => x.author.ccid === client.ccid)
                const reactedUsersList = reactions.map((reaction) => {
                    return reaction !== undefined ? (
                        <Box
                            key={reaction.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none'
                            }}
                            component={routerLink}
                            to={reaction.profileOverride?.link ?? '/entity/' + reaction.author.ccid}
                            target={reaction.profileOverride?.link ? '_blank' : undefined}
                            rel={reaction.profileOverride?.link ? 'noopener noreferrer' : undefined}
                        >
                            <CCAvatar
                                sx={{
                                    height: '20px',
                                    width: '20px'
                                }}
                                avatarURL={reaction.profileOverride?.avatar ?? reaction.author.profile?.avatar}
                                identiconSource={reaction.author.ccid}
                                alt={reaction.author.ccid}
                            />
                            <Typography
                                sx={{
                                    fontSize: '0.8rem',
                                    color: '#fff'
                                }}
                            >
                                {reaction.profileOverride?.username ?? reaction.author.profile?.username ?? 'anonymous'}
                            </Typography>
                        </Box>
                    ) : (
                        <Fragment key={0} />
                    )
                })

                return (
                    <Tooltip
                        arrow
                        key={key}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box component="img" height="20px" src={key}></Box>
                                    {reactions[0].shortcode}
                                </Box>
                                <Divider flexItem></Divider>
                                {reactedUsersList}
                            </Box>
                        }
                        placement="top"
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
                                if (ownReaction) {
                                    service.removeReaction(ownReaction.id)
                                } else {
                                    service.addReaction(reactions[0].shortcode, key)
                                }
                            }}
                        >
                            <Box component="img" height="20px" src={key} />
                            <Typography color={ownReaction ? 'primary.contrastText' : 'text.primary'}>
                                {reactions.length}
                            </Typography>
                        </Button>
                    </Tooltip>
                )
            })}
        </Box>
    )
}
