import { Autocomplete, Box, Chip, InputBase, type SxProps } from '@mui/material'
import { type CommonstreamSchema, Schemas, type Timeline } from '@concurrent-world/client'
import { useMemo } from 'react'

export interface StreamPickerProps {
    selected: Array<Timeline<CommonstreamSchema>>
    setSelected: (selected: Array<Timeline<CommonstreamSchema>>) => void
    sx?: SxProps
    options: Array<Timeline<CommonstreamSchema>>
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
            ).filter((stream: Timeline<any>) => stream.schema === Schemas.commonstream) as Array<
                Timeline<CommonstreamSchema>
            >,
        [props.selected]
    )

    console.log('!!!!!!!!!!! selected !!!!!!!!!!!!!!', props.selected)

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
                getOptionKey={(option: Timeline<CommonstreamSchema>) => option.id ?? ''}
                getOptionLabel={(option: Timeline<CommonstreamSchema>) => option.document.body.name}
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
