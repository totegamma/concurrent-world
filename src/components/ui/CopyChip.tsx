import { Chip, alpha, useTheme } from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { useSnackbar } from 'notistack'

export const CopyChip = (props: { label: string; content: string }): JSX.Element => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    return (
        <Chip
            sx={{
                cursor: 'pointer',
                backgroundColor: alpha(theme.palette.text.primary, 0.1)
            }}
            size="small"
            label={props.label}
            deleteIcon={<ContentPasteIcon />}
            onDelete={() => {
                navigator.clipboard.writeText(props.content)
                enqueueSnackbar('Copied', { variant: 'info' })
            }}
        />
    )
}
