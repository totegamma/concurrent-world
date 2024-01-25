import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import ApiProvider from '../context/api'
import type { ConcurrentTheme } from '../model'
import { CssBaseline, Fade, IconButton, Paper, ThemeProvider, darken } from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, loadConcurrentTheme } from '../themes'
import { type Identity, generateIdentity } from '../util'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
    Client,
    Schemas,
    type CoreCharacter,
    type CoreDomain,
    type ProfileSchema,
    type DomainProfileSchema
} from '@concurrent-world/client'
import { RegistrationWelcome } from '../components/Registration/Welcome'
import { YourID } from '../components/Registration/YourID'
import { SaveSecretCode } from '../components/Registration/SecretCode'
import { VerifyCode } from '../components/Registration/VerifyCode'
import { ChooseDomain } from '../components/Registration/ChooseDomain'
import { CreateProfile } from '../components/Registration/CreateProfile'
import { RegistrationReady } from '../components/Registration/LetsGo'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { defaultPreference } from '../context/PreferenceContext'

export function Registration(): JSX.Element {
    const location = useLocation()

    const { t, i18n } = useTranslation('', { keyPrefix: 'registration' })
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName))
    const [domain, setDomain] = usePersistent<string>('Domain', 'hub.concurrent.world')
    const [client, initializeClient] = useState<Client>()
    const [host, setHost] = useState<CoreDomain | null | undefined>()
    const [identity, setIdentity] = usePersistent<Identity>('CreatedIdentity', generateIdentity())
    const [profile, setProfile] = useState<ProfileSchema | null>(null)
    const [mnemonicLanguage, setMnemonicLanguage] = useState<'ja' | 'en'>(i18n.language === 'ja' ? 'ja' : 'en')

    const activeStep = parseInt(location.hash.replace('#', '')) || 0
    const setActiveStep = (step: number): void => {
        window.location.hash = step.toString()
    }

    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(loadConcurrentTheme(newThemeName))
    }

    useEffect(() => {
        Client.create(identity.privateKey, domain).then((client) => {
            initializeClient(client)
        })
    }, [])

    useEffect(() => {
        if (activeStep !== 0) return
        const newIdentity = generateIdentity()
        setIdentity(newIdentity)
    }, [activeStep])

    useEffect(() => {
        if (!host) return
        setDomain(host.fqdn)
        const api = new Client(identity.privateKey, host.fqdn)
        initializeClient(api)
    }, [host])

    const setupAccount = (): void => {
        if (!client) return
        if (!host) return
        localStorage.setItem('Domain', JSON.stringify(host.fqdn))
        localStorage.setItem('PrivateKey', JSON.stringify(identity.privateKey))
        localStorage.setItem(
            'Mnemonic',
            JSON.stringify(mnemonicLanguage === 'ja' ? identity.mnemonic_ja : identity.mnemonic_en)
        )

        console.log('hostAddr', host.ccid)

        client?.api
            .getCharacter<DomainProfileSchema>(host.ccid, Schemas.domainProfile)
            .then((profile: CoreCharacter<DomainProfileSchema> | null | undefined) => {
                console.log('domainprofile:', profile)
                const list = {
                    home: {
                        label: 'Home',
                        pinned: true,
                        streams: profile?.payload.body.defaultFollowingStreams
                            ? profile.payload.body.defaultFollowingStreams
                            : [],
                        userStreams: [],
                        expanded: false,
                        defaultPostStreams: profile?.payload.body.defaultPostStreams
                            ? profile.payload.body.defaultPostStreams
                            : []
                    }
                }

                const pref = {
                    ...defaultPreference,
                    lists: list
                }

                const storage = JSON.stringify(pref)
                client.api.writeKV('world.concurrent.preference', storage)

                window.location.href = '/'
            })
            .catch((_) => {
                const list = {
                    home: {
                        label: 'Home',
                        pinned: true,
                        streams: [],
                        userStreams: [],
                        expanded: false,
                        defaultPostStreams: []
                    }
                }

                const pref = {
                    ...defaultPreference,
                    lists: list
                }

                const storage = JSON.stringify(pref)
                client.api.writeKV('world.concurrent.preference', storage)

                window.location.href = '/'
            })
    }

    const steps = [
        {
            title: t('welcome.title'),
            component: (
                <RegistrationWelcome
                    identity={identity}
                    next={() => {
                        setActiveStep(1)
                    }}
                />
            )
        },
        {
            title: t('yourID.title'),
            component: (
                <YourID
                    identity={identity}
                    next={() => {
                        setActiveStep(2)
                    }}
                />
            )
        },
        {
            title: t('saveSecret.title'),
            component: (
                <SaveSecretCode
                    identity={identity}
                    next={() => {
                        setActiveStep(3)
                    }}
                    mnemonicLanguage={mnemonicLanguage}
                    setMnemonicLanguage={setMnemonicLanguage}
                />
            )
        },
        {
            title: t('verifyCode.title'),
            component: (
                <VerifyCode
                    identity={identity}
                    next={() => {
                        setActiveStep(4)
                    }}
                />
            )
        },
        {
            title: t('chooseDomain.title'),
            component: (
                <ChooseDomain
                    identity={identity}
                    next={() => {
                        setActiveStep(5)
                    }}
                    client={client}
                    host={host}
                    setHost={setHost}
                />
            )
        },
        {
            title: t('createProfile.title'),
            component: (
                <CreateProfile
                    next={() => {
                        setActiveStep(6)
                    }}
                    client={client}
                    setProfile={setProfile}
                />
            )
        },
        {
            title: t('ready.title'),
            component: (
                <RegistrationReady
                    identity={identity}
                    next={() => {
                        setupAccount()
                    }}
                    host={host}
                    profile={profile}
                />
            )
        }
    ]

    if (!client) return <>api constructing...</>

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ApiProvider client={client}>
                <Box
                    sx={{
                        padding: '20px',
                        gap: '20px',
                        display: 'flex',
                        width: '100vw',
                        minHeight: '100dvh',
                        flexDirection: 'column',
                        background: [
                            theme.palette.background.default,
                            `linear-gradient(${theme.palette.background.default}, ${darken(
                                theme.palette.background.default,
                                0.1
                            )})`
                        ]
                    }}
                >
                    <Button
                        disableRipple
                        variant="text"
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            textTransform: 'none',
                            '&:hover': {
                                background: 'none'
                            }
                        }}
                        onClick={randomTheme}
                    >
                        <ConcurrentWordmark color={theme.palette.background.contrastText} />
                    </Button>
                    <Paper
                        sx={{
                            display: 'flex',
                            position: 'relative',
                            overflow: 'hidden',
                            width: '100%',
                            flex: 1
                        }}
                    >
                        {steps.map((step, index) => (
                            <Fade key={index} in={activeStep === index}>
                                <Box
                                    sx={{
                                        padding: '20px',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            mb: '30px'
                                        }}
                                    >
                                        {activeStep !== 0 && (
                                            <IconButton
                                                sx={{
                                                    width: '50px'
                                                }}
                                                onClick={() => {
                                                    setActiveStep(activeStep - 1)
                                                }}
                                            >
                                                <ArrowBackIosNewIcon />
                                            </IconButton>
                                        )}
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                display: 'flex',
                                                flex: 1,
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {step.title}
                                        </Typography>
                                        {activeStep !== 0 && <Box sx={{ width: '50px' }} />}
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            flex: 1,
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {step.component}
                                    </Box>
                                </Box>
                            </Fade>
                        ))}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%'
                            }}
                        ></Box>
                    </Paper>
                    {activeStep === 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                alignItems: 'center'
                            }}
                        >
                            <Typography color="background.contrastText">{t('alreadyHaveAccount')}</Typography>
                            <Button component={Link} to="/import">
                                {t('importAccount')}
                            </Button>
                        </Box>
                    )}
                </Box>
            </ApiProvider>
        </ThemeProvider>
    )
}
