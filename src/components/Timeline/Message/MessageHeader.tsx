import { Box, Typography, Link } from '@mui/material'
import { TimeDiff } from '../../TimeDiff'
import { Link as RouterLink } from 'react-router-dom'

export interface MessageHeaderProps {
    username?: string
    messageID: string
    authorID: string
    cdate: Date
}

export const MessageHeader = (props: MessageHeaderProps): JSX.Element => {
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
                    display: 'flex'
                }}
            >
                <Typography
                    component="span"
                    sx={{
                        fontWeight: '700',
                        fontSize: { xs: '0.9rem', sm: '0.95rem' }
                    }}
                >
                    {props.username || 'anonymous'}
                </Typography>
            </Box>
            <Link
                component={RouterLink}
                underline="hover"
                color="inherit"
                fontSize="0.75rem"
                to={`/message/${props.messageID}@${props.authorID}`}
            >
                <TimeDiff date={new Date(props.cdate)} />
            </Link>
        </Box>
    )
}
