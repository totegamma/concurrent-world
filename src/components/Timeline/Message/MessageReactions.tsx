import type { Message as CCMessage } from '../../../model'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import { Box, Button } from '@mui/material'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'

export interface MessageReactionsProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
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

                console.log(reaction)

                return (
                    <Button
                        key={shortcode}
                        sx={{
                            color: 'text.primary',
                            p: 0,
                            backgroundColor: ownReaction ? 'primary.main' : '',
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
                        <Box component="img" height="20px" src={JSON.parse(reaction[0].payload).body.imageUrl}></Box>
                        {reaction.length}
                    </Button>
                )
            })}
        </Box>
    )
}
