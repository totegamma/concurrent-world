import { type ProfileWithAddress } from '../../../model'
import { Box, Button, Divider, Tooltip, Typography, alpha, useTheme } from '@mui/material'
import { useApi } from '../../../context/api'
import { CCAvatar } from '../../CCAvatar'
import { Fragment } from 'react'
import { useMessageService } from '../MessageContainer'

import { type M_Reply, type M_Current, type M_Reroute } from '@concurrent-world/client'

export interface MessageReactionsProps {
    message: M_Current | M_Reply | M_Reroute
}

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const client = useApi()
    const theme = useTheme()
    const service = useMessageService()
    const filteredReactions = props.message.reactions.reduce((acc: any, cur) => {
        cur.shortcode in acc ? acc[cur.shortcode].push(cur) : (acc[cur.shortcode] = [cur])

        return acc
    }, {})

    return (
        <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(filteredReactions).map((r) => {
                const [shortcode, reaction]: [string, any] = r
                const ownReaction = reaction.find((x: any) => x.author === client.ccid)
                const reactedUsers =
                    reaction.map((x: any) => props.message.reactions.find((u) => u.author.ccaddr === x.author)) ?? []
                const reactedUsersList = reactedUsers.map((user: ProfileWithAddress | undefined) => {
                    return user !== undefined ? (
                        <Box
                            key={user.ccaddress}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <CCAvatar
                                sx={{
                                    height: '20px',
                                    width: '20px'
                                }}
                                avatarURL={user.avatar}
                                identiconSource={user.ccaddress}
                                alt={user.ccaddress}
                            />
                            {user.username ?? 'anonymous'}
                        </Box>
                    ) : (
                        <Fragment key={0} />
                    )
                })

                return (
                    <Tooltip
                        arrow
                        key={shortcode}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box component="img" height="20px" src={reaction[0].imageUrl}></Box>
                                    {shortcode}
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
                                    service.addReaction(shortcode, reaction[0].imageUrl)
                                }
                            }}
                        >
                            <Box component="img" height="20px" src={reaction[0].imageUrl} />
                            <Typography color={ownReaction ? 'primary.contrastText' : 'text.primary'}>
                                {reaction.length}
                            </Typography>
                        </Button>
                    </Tooltip>
                )
            })}
        </Box>
    )
}
