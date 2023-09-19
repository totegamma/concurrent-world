import { Box, Typography } from '@mui/material'
import { ConcurrentLogo } from '../theming/ConcurrentLogo'
import { useOnScreen } from '../../hooks/useOnScreen'
import React from 'react'

export interface LoadingProps {
    message: string
    color: string
}

export const Loading = (props: LoadingProps): JSX.Element => {
    const ref: React.RefObject<any> = React.createRef()
    const targetViewPosition = useOnScreen(ref)
    return (
        <div ref={ref}>
            <Box
                ref={ref}
                sx={{
                    color: props.color,
                    display: targetViewPosition === 'VISIBLE' ? 'flex' : 'none',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                }}
            >
                <ConcurrentLogo
                    size="30px"
                    upperColor={props.color}
                    lowerColor={props.color}
                    frameColor={props.color}
                    spinning={true}
                />
                <Typography variant="body1">{props.message}</Typography>
            </Box>
        </div>
    )
}
