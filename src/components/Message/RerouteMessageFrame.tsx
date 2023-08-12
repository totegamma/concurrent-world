import { Box, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'

import { type M_Reroute } from '@concurrent-world/client'
import RepeatIcon from '@mui/icons-material/Repeat'
import { CCAvatar } from '../ui/CCAvatar'
import { Link as routerLink, Link as RouterLink } from 'react-router-dom'
import { TimeDiff } from '../ui/TimeDiff'
import { MessageContainer, useMessageService } from './MessageContainer'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useState } from 'react'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useApi } from '../../context/api'

export interface RerouteMessageFrameProp {
    message: M_Reroute
    reloadMessage: () => void
    lastUpdated?: number
}

export const RerouteMessageFrame = (props: RerouteMessageFrameProp): JSX.Element => {
    const client = useApi()
    const service = useMessageService()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    return (
        <>
            <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                <Box
                    display="flex"
                    width={{ xs: '38px', sm: '48px' }}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <RepeatIcon sx={{ fontSize: '90%' }} />
                    <IconButton
                        sx={{
                            width: { xs: '12px', sm: '18px' },
                            height: { xs: '12px', sm: '18px' }
                        }}
                        component={routerLink}
                        to={'/entity/' + props.message.author.ccid}
                    >
                        <CCAvatar
                            avatarURL={props.message.author.profile?.avatar}
                            identiconSource={props.message.author.ccid}
                            sx={{
                                width: { xs: '12px', sm: '18px' },
                                height: { xs: '12px', sm: '18px' }
                            }}
                        />
                    </IconButton>
                </Box>
                <Typography
                    sx={{
                        fontSize: {
                            xs: '0.9rem',
                            sm: '1rem'
                        },
                        color: 'text.disabled',
                        fontWeight: 700,
                        flex: 1
                    }}
                >
                    {props.message.author.profile?.username || 'Anonymous'} rerouted{' '}
                    {props.message.body && 'with comment:'}
                </Typography>
                <Box>
                    <IconButton
                        sx={{
                            width: { xs: '12px', sm: '18px' },
                            height: { xs: '12px', sm: '18px' },
                            color: 'text.disabled'
                        }}
                        onClick={(e) => {
                            setMenuAnchor(e.currentTarget)
                        }}
                    >
                        <MoreHorizIcon sx={{ fontSize: '80%' }} />
                    </IconButton>
                    <Link
                        component={RouterLink}
                        underline="hover"
                        color="inherit"
                        fontSize="0.75rem"
                        to={`/message/${props.message.id}@${props.message.author.ccid}`}
                    >
                        <TimeDiff date={new Date(props.message.cdate)} />
                    </Link>
                </Box>
            </Box>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                <MenuItem
                    onClick={() => {
                        service.openInspector()
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ManageSearchIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>詳細</ListItemText>
                </MenuItem>
                {props.message.author.ccid === client?.user?.ccid && (
                    <MenuItem
                        onClick={() => {
                            service.deleteMessage()
                        }}
                    >
                        <ListItemIcon>
                            <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>rerouteを削除</ListItemText>
                    </MenuItem>
                )}
            </Menu>
            {props.message.body && (
                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                    <Box display="flex" flexDirection="row-reverse" width={{ xs: '38px', sm: '48px' }} flexShrink={0} />
                    <Typography overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                        {props.message.body}
                    </Typography>
                </Box>
            )}
            <MessageContainer
                messageID={props.message.rerouteMessageId}
                messageOwner={props.message.rerouteMessageAuthor}
            />
        </>
    )
}
