import { Box, IconButton, ListItem } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import { MessageHeader } from './MessageHeader'
import { type Character, type Message } from '@concurrent-world/client'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import { type ReplyMessage } from '../../../schemas/replyMessage'
import { type Profile } from '../../../schemas/profile'
import { SimpleNote } from '../SimpleNote'

export interface ThinMessageViewProps {
    message: Message<TypeSimpleNote | ReplyMessage>
    author: Character<Profile> | undefined
}

export const ThinMessageView = (props: ThinMessageViewProps): JSX.Element => {
    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                p: { xs: '7px 0', sm: '10px 0' },
                wordBreak: 'break-word',
                gap: 2
            }}
        >
            {props.message?.payload?.body && (
                <>
                    <IconButton
                        sx={{
                            width: { xs: '24px', sm: '36px' },
                            height: { xs: '24px', sm: '36px' },
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
                                width: { xs: '24px', sm: '36px' },
                                height: { xs: '24px', sm: '36px' }
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
                        <SimpleNote message={props.message} />
                    </Box>
                </>
            )}
        </ListItem>
    )
}
