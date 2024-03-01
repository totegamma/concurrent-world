import {
    Box,
    Button,
    Divider,
    FormControlLabel,
    FormGroup,
    IconButton,
    MenuItem,
    Select,
    Switch,
    Typography
} from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useClient } from '../../context/ClientContext'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { IssueJWT } from '@concurrent-world/client'
import { useTranslation } from 'react-i18next'

export const GeneralSettings = (): JSX.Element => {
    const { client } = useClient()
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [invitationCode, setInvitationCode] = useState<string>('')

    const [showEditorOnTop, setShowEditorOnTop] = usePreference('showEditorOnTop')
    const [showEditorOnTopMobile, setShowEditorOnTopMobile] = usePreference('showEditorOnTopMobile')
    const [devMode, setDevMode] = usePreference('devMode')

    const tags = client?.api?.getTokenClaims()?.tag?.split(',') ?? []
    const { enqueueSnackbar } = useSnackbar()

    const [currentLanguage, setCurrentLanguage] = useState<string>('')

    const { t, i18n } = useTranslation('', { keyPrefix: 'settings.general' })

    useEffect(() => {
        setCurrentLanguage(i18n.language)
    }, [])

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            <Box>
                <Typography variant="h3">{t('language')}</Typography>
                <Select
                    value={currentLanguage}
                    onChange={(e) => {
                        i18n.changeLanguage(e.target.value)
                        setCurrentLanguage(e.target.value)
                    }}
                >
                    <MenuItem value={'en'}>English</MenuItem>
                    <MenuItem value={'ja'}>日本語</MenuItem>
                    <MenuItem value={'kr'}>한국어 (translated by @Alternative)</MenuItem>
                    <MenuItem value={'th'}>ภาษาไทย</MenuItem>
                </Select>
            </Box>
            <Box>
                <Typography variant="h3">{t('basic')}</Typography>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showEditorOnTop}
                                onChange={(e) => {
                                    setShowEditorOnTop(e.target.checked)
                                }}
                            />
                        }
                        label={t('showEditorOnTop')}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showEditorOnTopMobile}
                                onChange={(e) => {
                                    setShowEditorOnTopMobile(e.target.checked)
                                }}
                            />
                        }
                        label={t('showEditorOnTopMobile')}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={devMode}
                                onChange={(e) => {
                                    setDevMode(e.target.checked)
                                }}
                            />
                        }
                        label={t('developerMode')}
                    />
                </FormGroup>
            </Box>
            <Divider />

            {devMode && (
                <>
                    <Typography variant="h3" gutterBottom>
                        CCID
                    </Typography>
                    <Typography>{client.ccid}</Typography>

                    <Typography variant="h3" gutterBottom>
                        Host
                    </Typography>
                    <Typography>{client.api.host}</Typography>

                    <Typography variant="h3" gutterBottom>
                        Privatekey
                    </Typography>
                    <Typography
                        sx={{
                            wordBreak: 'break-all',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {showPrivateKey ? client.api.privatekey : '•••••••••••••••••••••••••••••••••••••••••••••••••'}
                        <IconButton
                            sx={{ ml: 'auto' }}
                            onClick={() => {
                                setShowPrivateKey(!showPrivateKey)
                            }}
                        >
                            {!showPrivateKey ? (
                                <VisibilityIcon sx={{ color: 'text.primary' }} />
                            ) : (
                                <VisibilityOffIcon sx={{ color: 'text.primary' }} />
                            )}
                        </IconButton>
                    </Typography>

                    <Typography variant="h3" gutterBottom>
                        HomeStream
                    </Typography>
                    <Typography gutterBottom>{client.user?.userstreams?.payload.body.homeStream}</Typography>

                    <Typography variant="h3" gutterBottom>
                        NotificationStream
                    </Typography>
                    <Typography gutterBottom>{client.user?.userstreams?.payload.body.notificationStream}</Typography>

                    <Typography variant="h3" gutterBottom>
                        AssociationStream
                    </Typography>
                    <Typography gutterBottom>{client.user?.userstreams?.payload.body.associationStream}</Typography>

                    <Divider />
                    <Typography variant="h3" gutterBottom>
                        Services
                    </Typography>

                    <Typography>{JSON.stringify(client.domainServices)}</Typography>
                </>
            )}

            {tags.includes('_invite') && (
                <>
                    {invitationCode === '' ? (
                        <Button
                            onClick={(_) => {
                                if (client.api.host === undefined) {
                                    return
                                }
                                if (!client?.keyPair?.privatekey) return
                                const jwt = IssueJWT(client.keyPair.privatekey, {
                                    iss: client.ccid,
                                    aud: client.host,
                                    sub: 'CONCURRENT_INVITE',
                                    exp: Math.floor((new Date().getTime() + 24 * 60 * 60 * 1000) / 1000).toString()
                                }) // 24h validity
                                setInvitationCode(jwt)
                            }}
                        >
                            {t('generateInviteCode')}
                        </Button>
                    ) : (
                        <>
                            <Typography variant="body1">{t('inviteCode')}</Typography>
                            <pre
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    backgroundColor: '#333',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    color: '#fff'
                                }}
                            >
                                {invitationCode}
                            </pre>
                            <Button
                                onClick={(_) => {
                                    navigator.clipboard.writeText(invitationCode)
                                    enqueueSnackbar(t('copied'), { variant: 'success' })
                                }}
                            >
                                {t('copyInviteCode')}
                            </Button>
                        </>
                    )}
                </>
            )}
        </Box>
    )
}
