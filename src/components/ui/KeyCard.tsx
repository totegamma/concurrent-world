import { type Key } from '@concurrent-world/client/dist/types/model/core'

import KeyIcon from '@mui/icons-material/Key'
import KeyOffIcon from '@mui/icons-material/KeyOff'
import { Box, Paper, Typography } from '@mui/material'

export const KeyCard = (props: { item: Key; endItem?: JSX.Element; short?: boolean }): JSX.Element => {
    const valid = props.item.revokePayload === 'null'

    return (
        <Paper
            variant="outlined"
            sx={{
                padding: 1,
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center'
            }}
        >
            {valid ? (
                <KeyIcon
                    sx={{
                        width: '40px',
                        height: '40px'
                    }}
                />
            ) : (
                <KeyOffIcon
                    sx={{
                        width: '40px',
                        height: '40px'
                    }}
                />
            )}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flex: 1
                }}
            >
                {props.short ? (
                    <>
                        <Typography>{props.item.id}</Typography>
                    </>
                ) : (
                    <>
                        <Typography>ID: {props.item.id}</Typography>
                        <Typography>Parent: {props.item.parent}</Typography>

                        {valid ? (
                            <>
                                <Typography>Valid Since: {props.item.validSince}</Typography>
                            </>
                        ) : (
                            <>
                                <Typography>
                                    Valid From: {props.item.validSince} to {props.item.validUntil}
                                </Typography>
                            </>
                        )}
                    </>
                )}
            </Box>
            {props.endItem}
        </Paper>
    )
}
