import { Autocomplete, Box, InputBase, type SxProps } from '@mui/material'
import { type CommunityTimelineSchema, type Timeline } from '@concurrent-world/client'
import { CCChip } from './CCChip'
import { useMemo } from 'react'

export interface StreamPickerProps {
    selected: Array<Timeline<CommunityTimelineSchema>>
    setSelected: (selected: Array<Timeline<CommunityTimelineSchema>>) => void
    sx?: SxProps
    options: Array<Timeline<CommunityTimelineSchema>>
}

export const StreamPicker = (props: StreamPickerProps): JSX.Element => {
    // WORKAROUND for vite circular JSON dependency
    const selected = useMemo(
        () =>
            JSON.parse(
                JSON.stringify(props.selected ?? [], (key, value) => {
                    if (key === 'client' || key === 'api') {
                        return undefined
                    }
                    return value
                })
            ),
        [props.selected]
    )

    return (
        <Box
            sx={{
                ...props.sx,
                borderRadius: 2,
                padding: '0px 10px',
                flex: '1',
                backgroundColor: 'background.paper'
            }}
        >
            <Autocomplete
                filterSelectedOptions
                disableClearable
                sx={{ width: 1 }}
                multiple
                value={selected}
                options={props.options}
                getOptionKey={(option: Timeline<CommunityTimelineSchema>) => option.id ?? ''}
                getOptionLabel={(option: Timeline<CommunityTimelineSchema>) => option.document.body.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => {
                    props.setSelected(value)
                }}
                componentsProps={{
                    clearIndicator: { sx: { color: 'text.disabled' } }
                }}
                forcePopupIcon={false}
                renderInput={(params) => {
                    const { InputLabelProps, InputProps, ...rest } = params

                    return (
                        <InputBase
                            {...params.InputProps}
                            {...rest}
                            sx={{ color: 'props.theme.palette.text.secondary' }}
                            placeholder={selected.length === 0 ? '投稿先の選択…' : ''}
                        />
                    )
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <CCChip
                            label={option.document.body.name}
                            sx={{ color: 'text.default' }}
                            {...getTagProps({ index })}
                            key={option.id}
                        />
                    ))
                }
            />
        </Box>
    )
}
