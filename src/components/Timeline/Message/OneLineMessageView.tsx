import { Box, Link, IconButton, Typography } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../../CCAvatar'
import { TimeDiff } from '../../TimeDiff'
import { type M_Current } from '@concurrent-world/client'

export interface OneLineMessageViewProps {
    message: M_Current
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
                to={'/entity/' + props.message.author.ccaddr}
            >
                <CCAvatar
                    alt={props.message.author.profile.username}
                    avatarURL={props.message.author.profile.avatar}
                    identiconSource={props.message.author.ccaddr}
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
                    {props.message.body}
                </Typography>
            </Box>
            <Link
                component="button"
                underline="hover"
                color="inherit"
                sx={{
                    display: 'flex',
                    flexShrink: 0,
                    fontSize: '0.75rem'
                }}
            >
                <TimeDiff date={new Date(props.message.cdate)} />
            </Link>
        </Box>
    )
}
