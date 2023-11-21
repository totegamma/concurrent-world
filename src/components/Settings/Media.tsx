import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material'
import { useRef, useState } from 'react'
import { usePreference } from '../../context/PreferenceContext'

import { useTranslation } from 'react-i18next'
import { Codeblock } from '../ui/Codeblock'
import { type s3Config } from '../../model'

export const MediaSettings = (): JSX.Element => {
    const pref = usePreference()
    const clientIdRef = useRef<HTMLInputElement>(null)

    const [buttonText, setButtonText] = useState<string>('Save')

    const [_s3Config, _setS3Config] = useState<s3Config>(pref.s3Config)

    const handleS3ConfigChange = (key: string, value: any): void => {
        _setS3Config({ ..._s3Config, [key]: value })
    }

    const handleS3ConfigSave = (): void => {
        pref.setS3Config(_s3Config)
        setButtonText('OK!')
        setTimeout(() => {
            setButtonText('Save')
        }, 2000)
    }

    const handleSave = (): void => {
        if (clientIdRef.current) {
            pref.setImgurClientID(clientIdRef.current.value)
            setButtonText('OK!')
            setTimeout(() => {
                setButtonText('Save')
            }, 2000)
        }
    }

    const { t } = useTranslation('', { keyPrefix: 'settings.media' })

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}
        >
            <Typography variant="h3">{t('imagePostSettings')}</Typography>

            <Typography>{t('storageProviderLabel')}</Typography>
            <Select
                value={pref.storageProvider}
                onChange={(v) => {
                    pref.setStorageProvider(v.target.value)
                }}
            >
                <MenuItem value="imgur">imgur</MenuItem>
                <MenuItem value="s3">s3</MenuItem>
            </Select>

            {pref.storageProvider === 'imgur' && (
                <>
                    <Paper sx={{ padding: '1em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                        <Typography>
                            {t('afterRegisteringImgur')}
                            <a href={'https://api.imgur.com/oauth2/addclient'}>{t('thisPage')}</a>
                            {t('oauth2')}
                        </Typography>
                        <Box>
                            <TextField
                                label="ClientId"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.imgurClientID}
                                inputRef={clientIdRef}
                                type="password"
                            />
                        </Box>
                        <Button variant="contained" onClick={handleSave}>
                            {buttonText}
                        </Button>
                    </Paper>
                </>
            )}
            {pref.storageProvider === 's3' && (
                <>
                    <Paper sx={{ padding: '1em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                        <Typography>{t('corsSettings')}</Typography>
                        <Codeblock language={'json'}>
                            {`[{
    "AllowedOrigins": [
        "https://localhost:5173",
        "https://concurrent.world"
    ],
        "AllowedMethods": [
        "GET",
        "POST",
        "PUT",
        "DELETE"
    ],
    "AllowedHeaders": [
        "*"
    ]
}]`}
                        </Codeblock>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                            <TextField
                                label="endpoint"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.s3Config.endpoint}
                                onChange={(v) => {
                                    handleS3ConfigChange('endpoint', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="accessKeyId"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.s3Config.accessKeyId}
                                onChange={(v) => {
                                    handleS3ConfigChange('accessKeyId', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="secretAccessKey"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.s3Config.secretAccessKey}
                                onChange={(v) => {
                                    handleS3ConfigChange('secretAccessKey', v.target.value)
                                }}
                                type="password"
                            />
                            <TextField
                                label="bucketName"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.s3Config.bucketName}
                                onChange={(v) => {
                                    handleS3ConfigChange('bucketName', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="publicUrl"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={pref.s3Config.publicUrl}
                                onChange={(v) => {
                                    handleS3ConfigChange('publicUrl', v.target.value)
                                }}
                                type="text"
                            />
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={_s3Config.forcePathStyle}
                                            onChange={(v) => {
                                                handleS3ConfigChange('forcePathStyle', v.target.checked)
                                            }}
                                        />
                                    }
                                    label="forcePathStyle"
                                />
                            </FormGroup>
                            <Button variant="contained" onClick={handleS3ConfigSave}>
                                {buttonText}
                            </Button>
                        </Box>
                    </Paper>
                </>
            )}
            <Divider />
        </Box>
    )
}
