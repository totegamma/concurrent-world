import { Box, Button, Typography } from '@mui/material'
import { forwardRef, useEffect, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { useSnackbar } from 'notistack'
import { UserPicker } from '../ui/UserPicker'
import { type User } from '@concurrent-world/client'
import Form from '@rjsf/mui'
import { type RegistryWidgetsType, type UiSchema, type WidgetProps } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'

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
        <UserPicker
            selected={selected}
            setSelected={(value) => {
                console.log(value)
                setSelected(value)
                props.onChange(value.map((e) => e.ccid))
            }}
        />
    )
}

const uiSchema: UiSchema = {
    users: {
        'ui:widget': 'userPicker'
    }
}

const widgets: RegistryWidgetsType = {
    userPicker: UserPickerWidget
}

export const Debugger = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()

    const [selected, setSelected] = useState<User[]>([])

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%'
                }}
            >
                <Form
                    schema={{
                        type: 'object',
                        properties: {
                            users: { type: 'array', items: { type: 'string' } }
                        }
                    }}
                    formData={{ users: ['con1n6t8wlevhr905fl2q72w07ehpyappvyu29cpvs'] }}
                    uiSchema={uiSchema}
                    widgets={widgets}
                    validator={validator}
                    onSubmit={(e) => {
                        console.log(e.formData)
                    }}
                />

                <Typography variant="h3">Debugger</Typography>

                <UserPicker selected={selected} setSelected={setSelected} />

                <Typography variant="h4">Buttons</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px'
                    }}
                >
                    <Button
                        onClick={() => {
                            enqueueSnackbar(`Notification${Math.random()}`, {
                                variant: 'success'
                            })
                        }}
                    >
                        Show Notification
                    </Button>
                </Box>
                <Typography variant="h4">ConnectedDomains</Typography>
                {client.api.domainCache &&
                    Object.keys(client.api.domainCache).map((domain, _) => (
                        <Box key={domain}>
                            <Typography>{domain}</Typography>
                            <pre>{JSON.stringify(client.api.domainCache[domain], null, 2)}</pre>
                        </Box>
                    ))}
            </Box>
        </div>
    )
})

Debugger.displayName = 'Debugger'
