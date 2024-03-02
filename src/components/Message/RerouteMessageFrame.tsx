import { Box, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material'

import { type Message, type RerouteMessageSchema } from '@concurrent-world/client'
import RepeatIcon from '@mui/icons-material/Repeat'
import { CCAvatar } from '../ui/CCAvatar'
import { Link as routerLink, Link as RouterLink } from 'react-router-dom'
import { TimeDiff } from '../ui/TimeDiff'
import { MessageContainer } from './MessageContainer'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useState } from 'react'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useClient } from '../../context/ClientContext'
import { useInspector } from '../../context/Inspector'
import { MarkdownRendererLite } from '../ui/MarkdownRendererLite'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'

export interface RerouteMessageFrameProp {
    message: Message<RerouteMessageSchema>
    lastUpdated?: number
    simple?: boolean
    additionalMenuItems?: JSX.Element | JSX.Element[]
}

export const RerouteMessageFrame = (props: RerouteMessageFrameProp): JSX.Element => {
    const { client } = useClient()
    const inspector = useInspector()
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
                        to={'/entity/' + props.message.author}
                    >
                        <CCAvatar
                            avatarURL={props.message.authorUser?.profile?.payload.body.avatar}
                            identiconSource={props.message.author}
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
                    {props.message.authorUser?.profile?.payload.body.username || 'Anonymous'} rerouted{' '}
                    {props.message.payload.body.body && 'with comment:'}
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
                        to={`/message/${props.message.id}@${props.message.author}`}
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
                        inspector.inspectItem({ messageId: props.message.id, author: props.message.author })
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <ManageSearchIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>詳細</ListItemText>
                </MenuItem>
                {props.additionalMenuItems}
                {props.message.author === client?.user?.ccid && (
                    <MenuItem
                        onClick={() => {
                            props.message.delete()
                        }}
                    >
                        <ListItemIcon>
                            <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                        </ListItemIcon>
                        <ListItemText>rerouteを削除</ListItemText>
                    </MenuItem>
                )}
            </Menu>
            {props.message.payload.body.body && (
                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }}>
                    <Box display="flex" flexDirection="row-reverse" width={{ xs: '38px', sm: '48px' }} flexShrink={0} />
                    <Typography
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        minWidth={0}
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                        <Tooltip
                            arrow
                            placement="top"
                            title={
                                <MarkdownRenderer
                                    messagebody={props.message.payload.body.body}
                                    emojiDict={props.message.payload.body.emojis ?? {}}
                                />
                            }
                        >
                            <Box>
                                <MarkdownRendererLite
                                    messagebody={props.message.payload.body.body}
                                    emojiDict={props.message.payload.body.emojis ?? {}}
                                    forceOneline={true}
                                />
                            </Box>
                        </Tooltip>
                    </Typography>
                </Box>
            )}
            <MessageContainer
                simple={props.simple}
                messageID={props.message.payload.body.rerouteMessageId}
                messageOwner={props.message.payload.body.rerouteMessageAuthor}
                rerouted={props.message}
            />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            ></Box>
        </>
    )
}
