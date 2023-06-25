import type { Message as CCMessage, ProfileWithAddress } from '../../../model'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import { Box, Button, Divider, Tooltip } from '@mui/material'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { CCAvatar } from '../../CCAvatar'

export interface MessageReactionsProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
    emojiUsers: ProfileWithAddress[]
}

export const MessageReactions = (props: MessageReactionsProps): JSX.Element => {
    const api = useApi()
    const allReactions = props.message.associations.filter((m) => m.schema === Schemas.emojiAssociation)
    const filteredReactions = allReactions.reduce((acc: any, cur) => {
        const payload = JSON.parse(cur.payload)
        payload.body.shortcode in acc ? acc[payload.body.shortcode].push(cur) : (acc[payload.body.shortcode] = [cur])

        return acc
    }, {})

    return (
        <Box display="flex" gap={1}>
            {Object.entries(filteredReactions).map((r) => {
                const [shortcode, reaction]: [string, any] = r
                const ownReaction = reaction.find((x: any) => x.author === api.userAddress)
                const reactedUsers =
                    reaction.map((x: any) => props.emojiUsers.find((u) => u.ccaddress === x.author)) ?? []
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
                        <></>
                    )
                })

                return (
                    <Tooltip
                        key={shortcode}
                        title={
                            <Box display="flex" flexDirection="column" alignItems="right" gap={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box
                                        component="img"
                                        height="20px"
                                        src={JSON.parse(reaction[0].payload).body.imageUrl}
                                    ></Box>
                                    {shortcode}
                                </Box>
                                <Divider flexItem></Divider>
                                {reactedUsersList}
                            </Box>
                        }
                        placement="top"
                    >
                        <Button
                            key={shortcode}
                            sx={{
                                color: 'text.primary',
                                p: 0,
                                borderColor: ownReaction ? 'primary.main' : '',
                                display: 'flex',
                                gap: 1
                            }}
                            variant="outlined"
                            onClick={() => {
                                if (ownReaction) {
                                    api.unFavoriteMessage(ownReaction.id, api.userAddress)
                                } else {
                                    api.addMessageReaction(
                                        props.message.id,
                                        api.userAddress,
                                        shortcode,
                                        JSON.parse(reaction[0].payload).body.imageUrl
                                    )
                                }
                            }}
                        >
                            <Box
                                component="img"
                                height="20px"
                                src={JSON.parse(reaction[0].payload).body.imageUrl}
                            ></Box>
                            {reaction.length}
                        </Button>
                    </Tooltip>
                )
            })}
        </Box>
    )
}
