import { Box, Link, Typography } from '@mui/material'
import { TimeDiff } from '../../TimeDiff'
import React from 'react'

export interface MessageHeaderProps {
    username?: string
    authorAddress: string
    cdate: string
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
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '5px'
                }}
            >
                <Typography
                    component="span"
                    sx={{
                        fontWeight: '700',
                        fontSize: {
                            xs: '0.9rem',
                            sm: '1rem'
                        }
                    }}
                >
                    {props.username || 'anonymous'}
                </Typography>
                <Typography
                    component="span"
                    sx={{
                        fontweight: '400',
                        fontSize: '10px',
                        display: {
                            xs: 'none',
                            sm: 'inline'
                        }
                    }}
                >
                    {props.authorAddress}
                </Typography>
            </Box>
            <Link component="button" underline="hover" color="inherit">
                <TimeDiff date={new Date(props.cdate)} />
            </Link>
        </Box>
    )
}
