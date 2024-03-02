import { Box, Button, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useClient } from '../../context/ClientContext'
import { useSnackbar } from 'notistack'
import { UserPicker } from '../ui/UserPicker'
import { type User } from '@concurrent-world/client'

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
