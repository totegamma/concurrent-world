import { Chip, type SxProps, alpha, useTheme } from '@mui/material'
import { type ForwardRefRenderFunction, type Ref, forwardRef } from 'react'
import { Link as NavLink } from 'react-router-dom'

export interface CCChipProps {
    label: string
    onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
    sx?: SxProps
    to?: string
    size?: 'small' | 'medium'
    icon?: JSX.Element
}

const _CCChip: ForwardRefRenderFunction<HTMLDivElement | HTMLAnchorElement, CCChipProps> = (props, ref) => {
    const theme = useTheme()

    if (props.to) {
        return (
            <Chip
                {...props}
                ref={ref as Ref<HTMLAnchorElement>}
                size={props.size}
                component={NavLink}
                to={props.to}
                sx={{
                    ...props.sx,
                    cursor: 'pointer',
                    backgroundColor: alpha(theme.palette.text.primary, 0.1)
                }}
                label={props.label}
                onDelete={props.onDelete}
                icon={props.icon}
            />
        )
    }

    return (
        <Chip
            {...props}
            ref={ref as Ref<HTMLDivElement>}
            size={props.size}
            sx={{
                ...props.sx,
                backgroundColor: alpha(theme.palette.text.primary, 0.1)
            }}
            label={props.label}
            onDelete={props.onDelete}
            icon={props.icon}
        />
    )
}

export const CCChip = forwardRef(_CCChip)
