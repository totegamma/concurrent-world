import { Box, Typography } from '@mui/material'
import { forwardRef } from 'react'
import { useApi } from '../../context/api'

export const Debugger = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()

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
