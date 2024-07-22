import { type Key } from '@concurrent-world/client/dist/types/model/core'

import KeyIcon from '@mui/icons-material/Key'
import KeyOffIcon from '@mui/icons-material/KeyOff'
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material'
import { type ConcurrentTheme } from '../../model'

export const KeyCard = (props: { item: Key; endItem?: JSX.Element; short?: boolean }): JSX.Element => {
    const valid = props.item.revokeDocument === null

    const theme = useTheme<ConcurrentTheme>()

    const bodyStyle = {
        fill: alpha(theme.palette.primary.main, 0.8),
        stroke: theme.palette.primary.main,
        strokeWidth: '5px'
    }

    const headerStyle = {
        fill: theme.palette.background.paper,
        stroke: theme.palette.primary.main,
        strokeWidth: '5px'
    }

    const decorationStyle = {
        fill: theme.palette.background.paper
    }

    const lineStyle = {
        stroke: theme.palette.primary.main,
        strokeWidth: '8px'
    }

    const bodyText = {
        fontFamily: 'Source Code Pro, monospace',
        fontWeight: 900,
        fill: theme.palette.primary.contrastText,
        fontSize: '39px'
    }

    const headerText = {
        fontFamily: 'Source Code Pro, monospace',
        fontWeight: 900,
        fill: theme.palette.text.primary,
        fontSize: '22.41px'
    }

    return (
        <div
            style={{
                marginTop: '15px'
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 415 115.03">
                <path
                    style={bodyStyle}
                    d="M42.5,102.53l106.44-.21c2.13,0,4.17.84,5.67,2.34l5.54,5.53c1.5,1.5,3.54,2.34,5.66,2.34h113.28c2.17,0,4.26-.88,5.77-2.45l5.26-5.45c1.52-1.57,3.61-2.46,5.79-2.45l108.53.33c4.44.01,8.05-3.59,8.05-8.03V10.56c0-4.43-3.59-8.03-8.03-8.03h-118.65c-2.12,0-4.16.84-5.66,2.35l-5.31,5.31c-1.5,1.5-3.54,2.35-5.66,2.35h-93.36c-2.12,0-4.16-.84-5.66-2.35l-5.31-5.31c-1.5-1.5-3.54-2.35-5.66-2.35H42.5"
                />
                <path
                    style={headerStyle}
                    d="M42.5,2.53l-31.97-.03c-4.44,0-8.04,3.61-8.03,8.05l.23,83.97c.01,4.43,3.61,8.02,8.04,8.01h31.73"
                />
                <circle style={decorationStyle} cx="52.5" cy="12.53" r="4" />
                <circle style={decorationStyle} cx="52.5" cy="92.53" r="4" />
                <circle style={decorationStyle} cx="402.5" cy="12.53" r="4" />
                <circle style={decorationStyle} cx="402.5" cy="92.53" r="4" />
                <line style={lineStyle} x1="42.5" y1="2.53" x2="42.5" y2="102.53" />
                <text style={headerText} transform="translate(27.5 95) rotate(-90)">
                    <tspan x="0" y="0">
                        {props.item.parent.substring(4, 10)}
                    </tspan>
                </text>
                <text style={bodyText} transform="translate(50 67.5)">
                    <tspan x="0" y="0">
                        {props.item.id.substring(0, 7) + '…' + props.item.id.substring(35, 42)}
                    </tspan>
                </text>
            </svg>
        </div>

        /*
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
        */
    )
}
