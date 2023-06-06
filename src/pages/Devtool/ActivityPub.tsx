import { Box } from '@mui/material'
import { forwardRef, useState } from 'react'
import type { RJSFSchema } from '@rjsf/utils'
import Form from '@rjsf/mui'
import validator from '@rjsf/validator-ajv8'
import { useApi } from '../../context/api'

const schema: RJSFSchema = {
    title: 'ActivityPubSettings',
    description: 'Activitypubに乗せるユーザー情報の設定',
    type: 'object',
    required: ['name', 'summary', 'profile_url', 'icon_url'],
    properties: {
        name: { type: 'string', title: 'Name' },
        summary: { type: 'string', title: 'Bio' },
        profile_url: { type: 'string', title: 'ProfileURL' },
        icon_url: { type: 'string', title: 'IconURL' }
    }
}

export const ActivityPub = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const api = useApi()
    const [loading, setLoading] = useState(false)

    const register = (form: any): void => {
        if (!api) {
            return
        }
        setLoading(true)
        const requestOptions = {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                id: api.userAddress,
                ...form
            })
        }

        api.fetchWithCredential(`https://${api.host!.fqdn}/api/v1/ap/entity`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                console.log(data)
                setLoading(false)
                alert('success')
            })
            .catch((e) => {
                alert(e)
                setLoading(false)
            })
    }

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                <Form
                    disabled={loading}
                    schema={schema}
                    validator={validator}
                    onSubmit={(e) => {
                        register(e.formData)
                    }}
                />
            </Box>
        </div>
    )
})

ActivityPub.displayName = 'ActivityPub'
