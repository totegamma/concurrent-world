import { Autocomplete, Box, Chip, InputBase, type SxProps } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { useApi } from '../context/api'
import { usePreference } from '../context/PreferenceContext'

export interface StreamPickerProps {
    selected: string[]
    setSelected: (selected: string[]) => void
    sx?: SxProps
}

interface StreamOption {
    label: string
    id: string
}

export const StreamPicker = memo<StreamPickerProps>((props: StreamPickerProps): JSX.Element => {
    const api = useApi()
    const pref = usePreference()
    const [options, setOptions] = useState<StreamOption[]>([])
    const [selectedStreams, setSelectedStreams] = useState<StreamOption[]>([])

    useEffect(() => {
        Promise.all(pref.bookmarkingStreams.map((e) => api.readStream(e))).then((a) => {
            setOptions(
                a
                    .filter((e) => e?.payload)
                    .map((e) => {
                        return {
                            label: e!.payload.body.name,
                            id: e!.id
                        }
                    })
            )
        })
    }, [])

    useEffect(() => {
        Promise.all(props.selected.map((e) => api.readStream(e))).then((a) => {
            setSelectedStreams(
                a
                    .filter((e) => e?.payload)
                    .map((e) => {
                        return { label: e!.payload.body.name, id: e!.id }
                    })
            )
        })
    }, [props.selected])

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
                            sx={{ color: 'props.theme.palette.text.secondary' }}
                            placeholder={props.selected.length === 0 ? '投稿先の選択…' : ''}
                        />
                    )
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        // disabling ESLint here becase 'key' should exist in {..getTagProps({index})}
                        // eslint-disable-next-line
                        <Chip label={option.label} sx={{ color: 'text.default' }} {...getTagProps({ index })} />
                    ))
                }
            />
        </Box>
    )
})
StreamPicker.displayName = 'StreamPicker'
