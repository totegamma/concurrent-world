import { Box } from '@mui/material'
import Form from '@rjsf/mui'
import validator from '@rjsf/validator-ajv8'
import { memo, useEffect, useState } from 'react'
import { fetchWithTimeout } from '../util'

export interface CCEditorProps {
    schemaURL: string
    onSubmit: (_: any) => void
}

export const CCEditor = memo<CCEditorProps>((props: CCEditorProps): JSX.Element => {
    const [schema, setSchema] = useState<any>()

    useEffect(() => {
        console.log(props.schemaURL)
        fetchWithTimeout(props.schemaURL, { method: 'GET' })
            .then((e) => e.json())
            .then((e) => {
                console.log(e)
                setSchema(e)
            })
    }, [])

    return (
        <Box>
            {schema && (
                <Form
                    schema={schema}
                    validator={validator}
                    onSubmit={(e) => {
                        console.log(e.formData)
                    }}
                />
            )}
        </Box>
    )
})

CCEditor.displayName = 'CCEditor'
