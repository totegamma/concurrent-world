import { Autocomplete, Box, Chip, InputBase } from '@mui/material'
import { useEffect, useState } from 'react'
import { useApi } from '../context/api'

export interface StreamPickerProps {
    selected: string[]
    setSelected: (selected: string[]) => void
    color?: string
}

interface StreamOption {
    label: string
    id: string
}

export function StreamPicker(props: StreamPickerProps): JSX.Element {
    const api = useApi()
    const [options, setOptions] = useState<StreamOption[]>([])
    const [selectedStreams, setSelectedStreams] = useState<StreamOption[]>([])

    useEffect(() => {
        setOptions(
            Object.values(api.streamCache)
                .filter((e) => e.payload)
                .map((e) => {
                    return {
                        label: e.payload.body.name,
                        id: e.id
                    }
                })
                .filter((e) => e.label)
        )
    }, [])

    useEffect(() => {
        Promise.all(props.selected.map((e) => api.readStream(e))).then((a) => {
            setSelectedStreams(
                a
                    .filter((e) => e?.payload)
                    .map((e) => {
                        return { label: e?.payload.body.name, id: e?.id }
                    }) as StreamOption[]
            )
        })
    }, [props.selected])

    return (
        <Box
            sx={{
                backgroundColor: props.color ?? 'primary.main',
                borderRadius: '20px',
                flex: '1'
            }}
        >
            <Autocomplete
                filterSelectedOptions
                sx={{ width: 1 }}
                multiple
                value={selectedStreams}
                options={options}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, value) => {
                    props.setSelected(value.map((e) => e.id))
                }}
                renderInput={(params) => {
                    const { InputLabelProps, InputProps, ...rest } = params

                    return (
                        <InputBase
                            {...params.InputProps}
                            {...rest}
                            sx={{ color: 'primary.contrastText' }}
                            placeholder="select"
                        />
                    )
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        // disabling ESLint here becase 'key' should exist in {..getTagProps({index})}
                        // eslint-disable-next-line
                        <Chip
                            label={option.label}
                            sx={{ color: 'text.default' }}
                            {...getTagProps({ index })}
                        />
                    ))
                }
            />
        </Box>
    )
}
