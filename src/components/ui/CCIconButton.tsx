import { IconButton, type SxProps, useTheme } from '@mui/material'
import { type ForwardRefRenderFunction, forwardRef } from 'react'

export interface CCIconButtonProps {
    children?: JSX.Element | JSX.Element[]
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
    sx?: SxProps
}

const _CCIconButton: ForwardRefRenderFunction<HTMLButtonElement, CCIconButtonProps> = (props, ref) => {
    const theme = useTheme()
    return (
        <IconButton
            {...props}
            ref={ref}
            sx={{
                ...props.sx,
                color: theme.palette.text.secondary,
                '&:disabled': {
                    color: theme.palette.text.disabled
                }
            }}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.children}
        </IconButton>
    )
}

export const CCIconButton = forwardRef(_CCIconButton)
