import { Box, Typography, Link, Tooltip } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { useContext, useMemo } from 'react'
import { ApplicationContext } from '../../App'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { type Message, type ReplyMessageSchema, type SimpleNoteSchema } from '@concurrent-world/client'

export interface MessageHeaderProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema>
}

export const MessageHeader = (props: MessageHeaderProps): JSX.Element => {
    const appData = useContext(ApplicationContext)

    const myAck = useMemo(() => {
        return appData.acklist.find((ack) => ack.ccid === props.message.author)
    }, [props.message, appData.acklist])

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
                    {props.message.payload.body.profileOverride?.username ||
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
