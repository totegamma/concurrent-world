import { Chip, alpha, useTheme } from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import { useSnackbar } from 'notistack'

export const CopyChip = (props: { label: string; content: string; limit?: number }): JSX.Element => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const limit = props.limit || Infinity
    const length = props.content.length
    const content =
        length > limit
            ? `${props.content.slice(0, limit / 2)}...${props.content.slice(length - limit / 2)}`
            : props.content

    const label = `${props.label}: ${content}`

    return (
        <Chip
            sx={{
                cursor: 'pointer',
                backgroundColor: alpha(theme.palette.text.primary, 0.1)
            }}
            size="small"
            label={label}
            deleteIcon={<ContentPasteIcon />}
            onDelete={() => {
                navigator.clipboard.writeText(props.content)
                enqueueSnackbar('Copied', { variant: 'info' })
            }}
        />
    )
}
