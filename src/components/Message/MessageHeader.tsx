import { Box, Typography, Link, Tooltip, Menu, IconButton } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { useMemo, useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { type Message, type ReplyMessageSchema, type MarkdownMessageSchema } from '@concurrent-world/client'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useClient } from '../../context/ClientContext'
import { ConcordBadge } from '../ui/Badge'

export interface MessageHeaderProps {
    message: Message<MarkdownMessageSchema | ReplyMessageSchema>
    usernameOverride?: string
    additionalMenuItems?: JSX.Element | JSX.Element[]
    timeLink?: string
}

export const MessageHeader = (props: MessageHeaderProps): JSX.Element => {
    const { client } = useClient()
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    const myAck = useMemo(() => {
        return client.ackings?.find((ack) => ack.ccid === props.message.author)
    }, [props.message, client])

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}
            >
                <Typography
                    component="span"
                    sx={{
                        fontWeight: '700',
                        fontSize: { xs: '0.9rem', sm: '0.95rem' }
                    }}
                >
                    {props.usernameOverride ||
                        props.message.document.body.profileOverride?.username ||
                        props.message.authorUser?.profile?.username ||
                        'anonymous'}
                </Typography>
                {myAck && (
                    <Tooltip arrow title="Ackしています" placement="top">
                        <CheckCircleIcon
                            sx={{
                                fontSize: '1rem',
                                color: 'primary.main'
                            }}
                        />
                    </Tooltip>
                )}
                {props.message.authorUser?.profile?.badges?.map((badge, i) => (
                    <ConcordBadge
                        key={i}
                        badgeId={badge.badgeId}
                        seriesId={badge.seriesId}
                        sx={{
                            height: '0.9rem',
                            borderRadius: 0.5
                        }}
                    />
                ))}
                {props.message.authorUser?.alias && (
                    <Typography
                        component="span"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }}
                    >
                        @{props.message.authorUser.alias}
                    </Typography>
                )}
            </Box>
            <Box display="flex" gap={0.5}>
                {props.additionalMenuItems && (
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
                )}
                <Link
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    fontSize="0.75rem"
                    to={props.timeLink ?? `/${props.message.author}/${props.message.id}`}
                    target={props.timeLink ? '_blank' : '_self'}
                >
                    <TimeDiff date={new Date(props.message.document.signedAt)} base={new Date(props.message.cdate)} />
                </Link>
            </Box>
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                {props.additionalMenuItems}
            </Menu>
        </Box>
    )
}
