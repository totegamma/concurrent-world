import { Box, Button, type SxProps, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { usePreference } from '../../../context/PreferenceContext'

const sx: SxProps = {
    marginX: {
        sm: 0,
        md: '20px'
    },
    marginTop: '10px',
    maxWidth: '500px'
}

export const ImgurSettings = (): JSX.Element => {
    const pref = usePreference()

    const clientIdRef = useRef<HTMLInputElement>(null)

    const [buttonText, setButtonText] = useState<string>('Save')

    const handleSave = (): void => {
        if (clientIdRef.current) {
            pref.setImgurClientID(clientIdRef.current.value)
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
                    Imgurに登録した後、<a href={'https://api.imgur.com/oauth2/addclient'}>このページ</a>
                    でアプリケーションを&quot;OAuth 2 authorization without a callback URL&quot;で作成してください。
                </Typography>
                <Box>
                    <TextField
                        label="ClientId"
                        variant="outlined"
                        fullWidth={true}
                        sx={sx}
                        defaultValue={pref.imgurClientID}
                        inputRef={clientIdRef}
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
