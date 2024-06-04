import { type User } from '@concurrent-world/client'
import { Box, IconButton, ListItem, Paper, type SxProps, Tooltip } from '@mui/material'
import { UserProfileCard } from './UserProfileCard'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from './ui/CCAvatar'
import { type ProfileOverride } from '@concurrent-world/client/dist/types/model/core'

export interface ContentWithCCAvatarProps {
    author?: User
    profileOverride?: ProfileOverride
    avatarOverride?: string
    children?: JSX.Element | Array<JSX.Element | undefined>
    sx?: SxProps
}

export const ContentWithCCAvatar = (props: ContentWithCCAvatarProps): JSX.Element => {
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
            <Tooltip
                enterDelay={500}
                enterNextDelay={500}
                leaveDelay={300}
                placement="top"
                components={{
                    Tooltip: Paper
                }}
                componentsProps={{
                    tooltip: {
                        sx: {
                            m: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            minWidth: '300px'
                        }
                    }
                }}
                title={<UserProfileCard user={props.author} />}
            >
                <IconButton
                    sx={{
                        width: { xs: '38px', sm: '48px' },
                        height: { xs: '38px', sm: '48px' },
                        mt: { xs: '3px', sm: '5px' }
                    }}
                    component={routerLink}
                    to={props.profileOverride?.link ?? '/' + (props.author?.ccid ?? '')}
                    target={props.profileOverride?.link ? '_blank' : undefined}
                    rel={props.profileOverride?.link ? 'noopener noreferrer' : undefined}
                >
                    <CCAvatar
                        avatarURL={props.author?.profile?.avatar}
                        avatarOverride={props.avatarOverride || props.profileOverride?.avatar}
                        identiconSource={props.author?.ccid ?? ''}
                        sx={{
                            width: { xs: '38px', sm: '48px' },
                            height: { xs: '38px', sm: '48px' }
                        }}
                    />
                </IconButton>
            </Tooltip>
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                    overflow: 'hidden',
                    ...props.sx
                }}
            >
                {props.children}
            </Box>
        </ListItem>
    )
}
