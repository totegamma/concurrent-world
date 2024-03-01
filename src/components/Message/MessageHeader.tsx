import { Box, Typography, Link, Tooltip, Menu, IconButton } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { useMemo, useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { type Message, type ReplyMessageSchema, type SimpleNoteSchema } from '@concurrent-world/client'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useClient } from '../../context/ClientContext'

export interface MessageHeaderProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema>
    usernameOverride?: string
    additionalMenuItems?: JSX.Element | JSX.Element[]
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
                    alignItems: 'center'
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
                        props.message.payload.body.profileOverride?.username ||
                        props.message.authorUser?.profile?.payload.body.username ||
                        'anonymous'}
                </Typography>
                {myAck && (
                    <Tooltip arrow title="Ackしています" placement="top">
                        <CheckCircleIcon
                            sx={{
                                fontSize: '1rem',
                                color: 'primary.main',
                                marginLeft: '0.25rem'
                            }}
                        />
                    </Tooltip>
                )}
                {props.message.authorUser?.certs?.map((cert, i) => (
                    <Tooltip arrow key={i} title={cert.description} placement="top">
                        <Box
                            component="img"
                            src={cert.icon}
                            sx={{
                                height: '0.9rem',
                                marginLeft: '0.25rem'
                            }}
                        />
                    </Tooltip>
                ))}
            </Box>
            <Box>
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
                    to={`/message/${props.message.id}@${props.message.author}`}
                >
                    <TimeDiff date={new Date(props.message.cdate)} />
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
