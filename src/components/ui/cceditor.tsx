import { Box, Button, Typography } from '@mui/material'
import Form from '@rjsf/mui'
import validator from '@rjsf/validator-ajv8'
import { memo, useEffect, useState } from 'react'
import { fetchWithTimeout } from '../../util'
import { useClient } from '../../context/ClientContext'
import { type User } from '@concurrent-world/client'
import { UserPicker } from '../ui/UserPicker'
import { type RegistryWidgetsType, type UiSchema, type WidgetProps } from '@rjsf/utils'

export interface CCEditorProps {
    schemaURL?: string
    schema?: any
    value: any
    setValue: (_: any) => void
    disabled?: boolean
    showSubmit?: boolean
}

const UserPickerWidget = (props: WidgetProps): JSX.Element => {
    const { client } = useClient()

    const [selected, setSelected] = useState<User[]>([])
    useEffect(() => {
        if (!props.value || !client) return
        Promise.all(props.value.map((e: string) => client.getUser(e))).then((e) => {
            setSelected(e.filter((e) => e) as User[])
        })
    }, [props])

    return (
        <>
            <Typography>{props.label}</Typography>
            <UserPicker
                selected={selected}
                setSelected={(value) => {
                    console.log(value)
                    setSelected(value)
                    props.onChange(value.map((e) => e.ccid))
                }}
            />
        </>
    )
}

const widgets: RegistryWidgetsType = {
    userPicker: UserPickerWidget
}

export const CCEditor = memo<CCEditorProps>((props: CCEditorProps): JSX.Element => {
    const [schema, setSchema] = useState<any>(props.schema)

    const uiSchema: UiSchema = schema?.ui || {}

    useEffect(() => {
        if (props.schema || !props.schemaURL) return
        fetchWithTimeout(props.schemaURL, { method: 'GET' })
            .then((e) => e.json())
            .then((e) => {
                setSchema(e)
                // if not compatible, reset form data
                if (props.value) {
                    const errors = validator.rawValidation(schema, props.value)
                    if (errors.errors && errors.errors.length > 0) {
                        props.setValue({})
                    }
                }
            })
    }, [props.schemaURL])

    if (!props.schemaURL && !props.schema) {
        return <Box>Bad Input</Box>
    }

    return (
        <Box>
            {schema && (
                <Form
                    disabled={props.disabled}
                    schema={schema}
                    validator={validator}
                    formData={props.value}
                    uiSchema={uiSchema}
                    widgets={widgets}
                    onChange={(e) => {
                        props.setValue(e.formData)
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            display: props.showSubmit ? 'block' : 'none'
                        }}
                    >
                        Submit
                    </Button>
                </Form>
            )}
        </Box>
    )
})

CCEditor.displayName = 'CCEditor'
