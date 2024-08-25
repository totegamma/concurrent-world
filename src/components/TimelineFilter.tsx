import { Schemas } from '@concurrent-world/client'
import { Box, Chip, type SxProps } from '@mui/material'

export interface TimelineFilterProps {
    selected: string | undefined
    setSelected: (value: string | undefined) => void
    sx: SxProps
}

export const TimelineFilter = (props: TimelineFilterProps): JSX.Element => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                py: 1,
                overflowX: 'auto',
                width: '100%',
                scrollbarWidth: 'none',
                ...props.sx
            }}
        >
            <Chip
                label={'リプライ'}
                onClick={() => {
                    props.setSelected(
                        props.selected === Schemas.replyAssociation ? undefined : Schemas.replyAssociation
                    )
                }}
                color="primary"
                variant={props.selected === Schemas.replyAssociation ? 'filled' : 'outlined'}
            />
            <Chip
                label={'メンション'}
                onClick={() => {
                    props.setSelected(
                        props.selected === Schemas.mentionAssociation ? undefined : Schemas.mentionAssociation
                    )
                }}
                color="primary"
                variant={props.selected === Schemas.mentionAssociation ? 'filled' : 'outlined'}
            />
            <Chip
                label={'リルート'}
                onClick={() => {
                    props.setSelected(
                        props.selected === Schemas.rerouteAssociation ? undefined : Schemas.rerouteAssociation
                    )
                }}
                color="primary"
                variant={props.selected === Schemas.rerouteAssociation ? 'filled' : 'outlined'}
            />
            <Chip
                label={'お気に入り'}
                onClick={() => {
                    props.setSelected(props.selected === Schemas.likeAssociation ? undefined : Schemas.likeAssociation)
                }}
                color="primary"
                variant={props.selected === Schemas.likeAssociation ? 'filled' : 'outlined'}
            />
            <Chip
                label={'リアクション'}
                onClick={() => {
                    props.setSelected(
                        props.selected === Schemas.reactionAssociation ? undefined : Schemas.reactionAssociation
                    )
                }}
                color="primary"
                variant={props.selected === Schemas.reactionAssociation ? 'filled' : 'outlined'}
            />
        </Box>
    )
}
