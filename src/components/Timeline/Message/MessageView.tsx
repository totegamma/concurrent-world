import { Box, IconButton, ListItem } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import { SimpleNote } from '../SimpleNote'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import type { Profile } from '../../../schemas/profile'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import type { ReplyMessage } from '../../../schemas/replyMessage'

export interface MessageViewProps {
    message: CCMessage<TypeSimpleNote | ReplyMessage>
    userCCID: string
    author: Character<Profile> | undefined
    favoriteUsers: ProfileWithAddress[]
    reactionUsers: ProfileWithAddress[]
    streams: Array<Stream<any>>
    beforeMessage?: JSX.Element
}

export const MessageView = (props: MessageViewProps): JSX.Element => {
    return (
        <ListItem
            sx={{
                wordBreak: 'break-word',
                alignItems: 'flex-start',
                flex: 1,
                gap: { xs: 1, sm: 2 }
            }}
            disablePadding
        >
            {props.message?.payload?.body && (
                <>
                    <IconButton
                        sx={{
                            width: { xs: '38px', sm: '48px' },
                            height: { xs: '38px', sm: '48px' },
                            mt: { xs: '3px', sm: '5px' }
                        }}
                        component={routerLink}
                        to={'/entity/' + props.message.author}
                    >
                        <CCAvatar
                            alt={props.author?.payload.body.username}
                            avatarURL={props.author?.payload.body.avatar}
                            identiconSource={props.message.author}
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' }
                            }}
                        />
                    </IconButton>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <MessageHeader
                            authorID={props.message.author}
                            messageID={props.message.id}
                            cdate={props.message.cdate}
                            username={props.author?.payload.body.username}
                        />
                        {props.beforeMessage}
                        <SimpleNote message={props.message} />
                        <MessageReactions message={props.message} emojiUsers={props.reactionUsers} />
                        <MessageActions
                            favoriteUsers={props.favoriteUsers}
                            message={props.message}
                            msgstreams={props.streams}
                            userCCID={props.userCCID}
                        />
                    </Box>
                </>
            )}
        </ListItem>
    )
}
