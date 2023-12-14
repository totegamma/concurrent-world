import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    FormGroup,
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePreference } from '../../context/PreferenceContext'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useTranslation } from 'react-i18next'
import { Codeblock } from '../ui/Codeblock'
import { type s3Config } from '../../model'
import { useApi } from '../../context/api'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

export const MediaSettings = (): JSX.Element => {
    const client = useApi()
    const [s3Config, setS3Config] = usePreference('s3Config')
    const [storageProvider, setStorageProvider] = usePreference('storageProvider')
    const [imgurClientID, setImgurClientID] = usePreference('imgurClientID')
    const clientIdRef = useRef<HTMLInputElement>(null)
    const [selectedImageID, setSelectedImageID] = useState<string | null>(null)

    const [buttonText, setButtonText] = useState<string>('Save')

    const [_s3Config, _setS3Config] = useState<s3Config>(s3Config)

    const handleS3ConfigChange = (key: string, value: any): void => {
        _setS3Config({ ..._s3Config, [key]: value })
    }

    const [myFiles, setMyFiles] = useState<any[]>([])

    const domainProfileAvailable = useMemo(() => {
        return 'mediaserver' in client.domainServices
    }, [client.domainServices])

    const [deleteMenu, setDeleteMenu] = useState<null | HTMLElement>(null)

    useEffect(() => {
        if (storageProvider !== 'domain') return
        client.api.fetchWithCredential(client.host, '/storage/files', {}).then((res) => {
            if (res.ok) {
                res.json().then((content) => {
                    console.log(content)
                    setMyFiles(content.reverse())
                })
            }
        })
    }, [storageProvider])

    const deleteFile = (id: string): void => {
        client.api
            .fetchWithCredential(client.host, `/storage/file/${id}`, {
                method: 'DELETE'
            })
            .then((res) => {
                if (res.ok) {
                    setMyFiles(myFiles.filter((e) => e.id !== id))
                }
            })
    }

    const handleS3ConfigSave = (): void => {
        setS3Config(_s3Config)
        setButtonText('OK!')
        setTimeout(() => {
            setButtonText('Save')
        }, 2000)
    }

    const handleSave = (): void => {
        if (clientIdRef.current) {
            setImgurClientID(clientIdRef.current.value)
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
                value={storageProvider}
                onChange={(v) => {
                    setStorageProvider(v.target.value as 'domain' | 'imgur' | 's3')
                }}
            >
                <MenuItem value="domain" disabled={!domainProfileAvailable}>
                    domain {domainProfileAvailable ? '' : '(not available)'}
                </MenuItem>
                <MenuItem value="imgur">imgur</MenuItem>
                <MenuItem value="s3">s3</MenuItem>
            </Select>

            {storageProvider === 'domain' && (
                <>
                    <Alert severity="info">
                        <AlertTitle>Domain Storage</AlertTitle>
                        {t('descs.domain')}
                    </Alert>
                    <ImageList cols={3} gap={8}>
                        {myFiles.map((file) => (
                            <ImageListItem key={file.id}>
                                <img src={file.url} alt={file.id} />
                                <ImageListItemBar
                                    title={file.id}
                                    subtitle={file.cdate}
                                    actionIcon={
                                        <IconButton
                                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                            onClick={(e) => {
                                                setSelectedImageID(file.id)
                                                setDeleteMenu(e.currentTarget)
                                            }}
                                        >
                                            <MoreHorizIcon />
                                        </IconButton>
                                    }
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                    <Menu
                        anchorEl={deleteMenu}
                        open={Boolean(deleteMenu)}
                        onClose={() => {
                            setDeleteMenu(null)
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                selectedImageID && deleteFile(selectedImageID)
                                setDeleteMenu(null)
                            }}
                        >
                            <ListItemIcon>
                                <DeleteForeverIcon />
                            </ListItemIcon>
                            <ListItemText>{t('deleteCompletely')}</ListItemText>
                        </MenuItem>
                    </Menu>
                </>
            )}

            {storageProvider === 'imgur' && (
                <>
                    <Alert severity="info">
                        <AlertTitle>Imgur</AlertTitle>
                        {t('descs.imgur')}
                    </Alert>

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
                                defaultValue={imgurClientID}
                                inputRef={clientIdRef}
                                type="password"
                            />
                        </Box>
                        <Button onClick={handleSave}>{buttonText}</Button>
                    </Paper>
                </>
            )}
            {storageProvider === 's3' && (
                <>
                    <Alert severity="info">
                        <AlertTitle>S3</AlertTitle>
                        {t('descs.s3')}
                    </Alert>

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
                                defaultValue={s3Config.endpoint}
                                onChange={(v) => {
                                    handleS3ConfigChange('endpoint', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="accessKeyId"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={s3Config.accessKeyId}
                                onChange={(v) => {
                                    handleS3ConfigChange('accessKeyId', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="secretAccessKey"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={s3Config.secretAccessKey}
                                onChange={(v) => {
                                    handleS3ConfigChange('secretAccessKey', v.target.value)
                                }}
                                type="password"
                            />
                            <TextField
                                label="bucketName"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={s3Config.bucketName}
                                onChange={(v) => {
                                    handleS3ConfigChange('bucketName', v.target.value)
                                }}
                                type="text"
                            />
                            <TextField
                                label="publicUrl"
                                variant="outlined"
                                fullWidth={true}
                                defaultValue={s3Config.publicUrl}
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
                            <Button onClick={handleS3ConfigSave}>{buttonText}</Button>
                        </Box>
                    </Paper>
                </>
            )}
            <Divider />
        </Box>
    )
}
