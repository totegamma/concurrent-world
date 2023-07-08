import { Box, IconButton, ListItem } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import { SimpleNote } from '../SimpleNote'
import { MessageHeader } from './MessageHeader'
import { type MessageViewProps } from './MessageView'

export const ThinMessageView = (props: MessageViewProps): JSX.Element => {
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
