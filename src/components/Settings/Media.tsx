import { Box, Button, Card, CardContent, Divider, MenuItem, Select, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { usePreference } from '../../context/PreferenceContext'

import { useTranslation } from 'react-i18next'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'
import { Codeblock } from '../ui/Codeblock'

export const MediaSettings = (): JSX.Element => {
    const pref = usePreference()
    const clientIdRef = useRef<HTMLInputElement>(null)

    const [buttonText, setButtonText] = useState<string>('Save')

    const handleS3ConfigSave = (key: string, value: string): void => {
        pref.setS3Config({ ...pref.s3Config, [key]: value })
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
                </>
            )}
            {pref.storageProvider === 's3' && (
                <>
                    <Typography>CORSの設定はコレ</Typography>
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
                                handleS3ConfigSave('endpoint', v.target.value)
                            }}
                            type="text"
                        />
                        <TextField
                            label="accessKeyId"
                            variant="outlined"
                            fullWidth={true}
                            defaultValue={pref.s3Config.accessKeyId}
                            onChange={(v) => {
                                handleS3ConfigSave('accessKeyId', v.target.value)
                            }}
                            type="text"
                        />
                        <TextField
                            label="secretAccessKey"
                            variant="outlined"
                            fullWidth={true}
                            defaultValue={pref.s3Config.secretAccessKey}
                            onChange={(v) => {
                                handleS3ConfigSave('secretAccessKey', v.target.value)
                            }}
                            type="password"
                        />
                        <TextField
                            label="bucketName"
                            variant="outlined"
                            fullWidth={true}
                            defaultValue={pref.s3Config.bucketName}
                            onChange={(v) => {
                                handleS3ConfigSave('bucketName', v.target.value)
                            }}
                            type="text"
                        />
                        <TextField
                            label="publicUrl"
                            variant="outlined"
                            fullWidth={true}
                            defaultValue={pref.s3Config.publicUrl}
                            onChange={(v) => {
                                handleS3ConfigSave('publicUrl', v.target.value)
                            }}
                            type="text"
                        />
                        <Button variant="contained" onClick={handleSave}>
                            {buttonText} (未実装)
                        </Button>
                    </Box>
                </>
            )}
            <Divider />

            {/*
            <Typography variant="h3">URLプレビュー設定</Typography>
            <Typography>
                URLプレビューに私用するAPIのURLを設定します。デフォルトでは、いずれアカウントのhostに移行する予定です。
            </Typography>
            <Box>
                <TextField
                    label="MediaProxyUrl"
                    variant="outlined"
                    fullWidth={true}
                    defaultValue={pref.mediaProxy}
                    inputRef={mediaProxyRef}
                    type="text"
                />
            </Box>
            <Button variant="contained" onClick={handleMediaProxySave}>
                {buttonText}
            </Button>
            */}
        </Box>
    )
}
