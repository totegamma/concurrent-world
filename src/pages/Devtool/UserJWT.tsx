import { forwardRef, useState } from 'react'
import { useApi } from '../../context/api'
import { Box, Button, TextField, Typography } from '@mui/material'

export const UserJWT = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const api = useApi()

    const [issuedJwt, setIssuedJwt] = useState<string>('')
    const [audience, setAudience] = useState<string>(api?.host ?? '')

    const issueJwt = (): void => {
        setIssuedJwt(
            api.constructJWT({
                aud: audience
            })
        )
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
            </Box>
        </div>
    )
})

UserJWT.displayName = 'UserJWT'
