import { Box, Link, IconButton, Typography } from '@mui/material'
import { Link as routerLink, Link as RouterLink } from 'react-router-dom'
import { CCAvatar } from '../ui/CCAvatar'
import { TimeDiff } from '../ui/TimeDiff'
import { Message, ReplyMessageSchema, SimpleNoteSchema } from '@concurrent-world/client'

export interface OneLineMessageViewProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema>
}

export const OneLineMessageView = (props: OneLineMessageViewProps): JSX.Element => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
                overflow: 'hidden',
                flex: 1,
                gap: { xs: 1, sm: 2 }
            }}
        >
            <IconButton
                sx={{
                    width: { xs: '38px', sm: '48px' },
                    height: { xs: '12px', sm: '18px' }
                }}
                component={routerLink}
                to={'/entity/' + props.message.author}
            >
                <CCAvatar
                    alt={props.message.authorUser?.profile?.payload.body.username}
                    avatarURL={props.message.authorUser?.profile?.payload.body.avatar}
                    identiconSource={props.message.author}
                    sx={{
                        width: { xs: '38px', sm: '48px' },
                        height: { xs: '12px', sm: '18px' }
                    }}
                />
            </IconButton>
            <Box display="flex" flex={1} overflow="hidden">
                <Typography
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    minWidth={0}
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                >
                    {props.message.payload.body.body}
                </Typography>
            </Box>
            <Link
                component={RouterLink}
                underline="hover"
                color="inherit"
                fontSize="0.75rem"
                to={`/message/${props.message.id}@${props.message.author}`}
            >
                <TimeDiff date={new Date(props.message.cdate)} />
            </Link>
        </Box>
    )
}
