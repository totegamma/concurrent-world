import { Box, Button, type SxProps, TextField, Typography } from '@mui/material'
import { useContext, useRef, useState } from 'react'
import { ApplicationContext } from '../../../App'

const sx: SxProps = {
    marginX: '20px',
    marginTop: '10px',
    maxWidth: '500px'
}

export const ImgurSettings = (): JSX.Element => {
    const appData = useContext(ApplicationContext)

    const clientIdRef = useRef<HTMLInputElement>(null)
    const clientSecretRef = useRef<HTMLInputElement>(null)

    const [buttonText, setButtonText] = useState<string>('Save')

    const handleSave = (): void => {
        if (clientIdRef.current && clientSecretRef.current) {
            appData.setImgurSettings({
                clientId: clientIdRef.current.value,
                clientSecret: clientSecretRef.current.value
            })
            setButtonText('OK!')
            setTimeout(() => {
                setButtonText('Save')
            }, 2000)
        }
    }
    return (
        <>
            <Box>
                <Typography variant="h3">ImgurSetting</Typography>
                <Typography>
                    Imgurに登録した後、
                    <a href={'https://api.imgur.com/oauth2/addclient'}>ここ</a>
                    でアプリケーションを作成してください。「OAuth 2 authorization without a callback URL」で大丈夫です
                </Typography>
                <Box>
                    <TextField
                        label="ClientId"
                        variant="outlined"
                        fullWidth={true}
                        sx={sx}
                        defaultValue={appData.imgurSettings.clientId}
                        inputRef={clientIdRef}
                        type="password"
                    />
                    <TextField
                        label="ClientSecret"
                        variant="outlined"
                        fullWidth={true}
                        sx={sx}
                        defaultValue={appData.imgurSettings.clientSecret}
                        inputRef={clientSecretRef}
                        type="password"
                    />
                </Box>
                <Button sx={sx} variant="contained" onClick={handleSave}>
                    {buttonText}
                </Button>
            </Box>
        </>
    )
}
