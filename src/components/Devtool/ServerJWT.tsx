import { Box, Button, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { useApi } from '../../context/api'

export const ServerJWT = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const client = useApi()
    const [serverSignedJwt, setServerSignedJwt] = useState<string>('')

    const getServersignedJwt = (): void => {
        client.api.getJWT().then((e) => {
            setServerSignedJwt(e)
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
                <Typography variant="h3">Server signed JWT</Typography>
                <Button onClick={getServersignedJwt}>issue</Button>
                <Typography>result:</Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>{serverSignedJwt}</Typography>
                <Button
                    onClick={() => {
                        navigator.clipboard.writeText(serverSignedJwt)
                    }}
                >
                    copy
                </Button>
            </Box>
        </div>
    )
})

ServerJWT.displayName = 'ServerJWT'
