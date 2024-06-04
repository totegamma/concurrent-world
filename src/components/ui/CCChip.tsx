import { Chip, type SxProps, alpha, useTheme } from '@mui/material'

export interface CCChipProps {
    label: string
    onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void
    sx?: SxProps
}

export const CCChip = (props: CCChipProps): JSX.Element => {
    const theme = useTheme()
    return (
        <Chip
            sx={{
                ...props.sx,
                backgroundColor: alpha(theme.palette.text.primary, 0.1)
            }}
            label={props.label}
            onDelete={props.onDelete}
        />
    )
}
