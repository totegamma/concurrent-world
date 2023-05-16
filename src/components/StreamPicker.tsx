import { Autocomplete, Box, Chip, InputBase } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ApplicationContext } from '../App'

export interface StreamPickerProps {
    selected: string[]
    setSelected: (selected: string[]) => void
}

interface StreamOption {
    label: string
    id: string
}

export function StreamPicker(props: StreamPickerProps): JSX.Element {
    const appData = useContext(ApplicationContext)
    const [allStreams, setAllStreams] = useState<StreamOption[]>([])
    const [selectedStreams, setSelectedStreams] = useState<StreamOption[]>([])

    useEffect(() => {
        setAllStreams(
            Object.values(appData.streamDict.body.current)
                .filter((e) => e.meta)
                .map((e) => {
                    return {
                        label: JSON.parse(e.meta).name as string,
                        id: e.id
                    }
                })
        )
    }, [appData.streamDict.body])

    useEffect(() => {
        Promise.all(
            props.selected.map((e) =>
                appData.streamDict.get(e).then((f) => {
                    return { label: JSON.parse(f.meta).name, id: f.id }
                })
            )
        ).then((e) => {
            setSelectedStreams(e)
        })
    }, [props.selected])

    return (
        <Box
            sx={{
                backgroundColor: 'primary.main',
                padding: '5px',
                borderRadius: '20px'
            }}
        >
            <Autocomplete
                sx={{ width: 1 }}
                multiple
                value={selectedStreams}
                options={allStreams}
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
                            sx={{ color: 'primary.contrastText' }}
                            {...getTagProps({ index })}
                        />
                    ))
                }
            />
        </Box>
    )
}
