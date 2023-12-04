import { Autocomplete, Box, Chip, InputBase, type SxProps } from '@mui/material'
import { type CommonstreamSchema, Schemas, type Stream } from '@concurrent-world/client'
import { useMemo } from 'react'

export interface StreamPickerProps {
    selected: Array<Stream<CommonstreamSchema>>
    setSelected: (selected: Array<Stream<CommonstreamSchema>>) => void
    sx?: SxProps
    options: Array<Stream<CommonstreamSchema>>
}

export const StreamPicker = (props: StreamPickerProps): JSX.Element => {
    const selected = useMemo(
        () =>
            JSON.parse(
                JSON.stringify(props.selected ?? [], (key, value) => {
                    if (key === 'client' || key === 'api') {
                        return undefined
                    }
                    return value
                })
            ).filter((stream: Stream<any>) => stream.schema === Schemas.commonstream) as Array<
                Stream<CommonstreamSchema>
            >,
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
                sx={{ width: 1 }}
                multiple
                value={selected}
                options={props.options}
                getOptionKey={(option: Stream<CommonstreamSchema>) => option.id ?? ''}
                getOptionLabel={(option: Stream<CommonstreamSchema>) => option.payload.name}
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
                        <Chip
                            label={option.payload.name}
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
