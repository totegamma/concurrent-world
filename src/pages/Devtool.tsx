import { useState } from 'react'
import { useApi } from '../context/api'
import { Box, Button, Divider, TextField, Typography } from '@mui/material'

export function Devtool(): JSX.Element {
    const api = useApi()
    const [issuedJwt, setIssuedJwt] = useState<string>('')
    const [audience, setAudience] = useState<string>(api?.host?.fqdn ?? '')
    const [serverSignedJwt, setServerSignedJwt] = useState<string>('')

    const issueJwt = (): void => {
        setIssuedJwt(
            api.constructJWT({
                aud: audience
            })
        )
    }

    const getServersignedJwt = (): void => {
        api.getJWT().then((e) => {
            setServerSignedJwt(e)
        })
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll',
                overflowX: 'hidden'
            }}
        >
            <Typography variant="h2">Devtool</Typography>
            <Divider />
            <Typography variant="h3">User signed JWT</Typography>
            <Typography variant="h4">audience</Typography>
            <TextField
                label="audience"
                multiline
                value={audience}
                onChange={(e: any) => {
                    setAudience(e.target.value)
                }}
            />
            <Button variant="contained" onClick={issueJwt}>
                issue
            </Button>
            <Typography>result:</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>{issuedJwt}</Typography>
            <Button
                variant="contained"
                onClick={() => {
                    navigator.clipboard.writeText(issuedJwt)
                }}
            >
                copy
            </Button>

            <Divider />

            <Typography variant="h3">Server signed JWT</Typography>
            <Button variant="contained" onClick={getServersignedJwt}>
                issue
            </Button>
            <Typography>result:</Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>{serverSignedJwt}</Typography>
            <Button
                variant="contained"
                onClick={() => {
                    navigator.clipboard.writeText(serverSignedJwt)
                }}
            >
                copy
            </Button>
        </Box>
    )
}
