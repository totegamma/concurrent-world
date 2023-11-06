import { Autocomplete, Box, Chip, InputBase, type SxProps } from '@mui/material'
import { CommonstreamSchema, type Stream } from '@concurrent-world/client'

export interface StreamPickerProps {
    selected: Stream<CommonstreamSchema>[]
    setSelected: (selected: Stream<CommonstreamSchema>[]) => void
    sx?: SxProps
    options: Stream<CommonstreamSchema>[]
}

export const StreamPicker = (props: StreamPickerProps): JSX.Element => {
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
                sx={{ width: 1 }}
                multiple
                value={props.selected}
                options={props.options}
                getOptionLabel={(option) => option.payload.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => {
                    props.setSelected(value)
                }}
                renderInput={(params) => {
                    const { InputLabelProps, InputProps, ...rest } = params

                    return (
                        <InputBase
                            {...params.InputProps}
                            {...rest}
                            sx={{ color: 'props.theme.palette.text.secondary' }}
                            placeholder={props.selected.length === 0 ? '投稿先の選択…' : ''}
                        />
                    )
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        // disabling ESLint here becase 'key' should exist in {..getTagProps({index})}
                        // eslint-disable-next-line
                        <Chip label={option.payload.name} sx={{ color: 'text.default' }} {...getTagProps({ index })} />
                    ))
                }
            />
        </Box>
    )
}
