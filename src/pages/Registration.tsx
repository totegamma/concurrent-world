import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import ApiProvider from '../context/api'
import type { ConcurrentTheme } from '../model'
import { CssBaseline, Fade, IconButton, Paper, ThemeProvider, darken } from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, createConcurrentTheme } from '../themes'
import { type Identity, generateIdentity } from '../util'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
    Client,
    type RawDomainProfile,
    type Profile,
    Schemas,
    type CoreCharacter,
    type CoreDomain
} from '@concurrent-world/client'
import { RegistrationWelcome } from '../components/Registration/Welcome'
import { YourID } from '../components/Registration/YourID'
import { SecretCode } from '../components/Registration/SecretCode'
import { VerifyCode } from '../components/Registration/VerifyCode'
import { ChooseDomain } from '../components/Registration/ChooseDomain'
import { CreateProfile } from '../components/Registration/CreateProfile'
import { RegistrationReady } from '../components/Registration/LetsGo'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function Registration(): JSX.Element {
    const { i18n } = useTranslation('', { keyPrefix: 'registration' })
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue')
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const [activeStep, setActiveStep] = useState(0)
    const [client, initializeClient] = useState<Client>()
    const [host, setHost] = useState<CoreDomain | null | undefined>()
    const [identity] = useState<Identity>(generateIdentity())
    const [profile, setProfile] = useState<Profile | null>(null)
    const [mnemonicLanguage, setMnemonicLanguage] = useState<'ja' | 'en'>(i18n.language === 'ja' ? 'ja' : 'en')

    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(createConcurrentTheme(newThemeName))
    }

    useEffect(() => {
        initializeClient(new Client(identity.privateKey, 'hub.concurrent.world'))
    }, [])

    useEffect(() => {
        if (!host) return
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
            .readCharacter(host.ccid, Schemas.domainProfile)
            .then((profile: CoreCharacter<RawDomainProfile> | null | undefined) => {
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
                console.log(list)
                localStorage.setItem('lists', JSON.stringify(list))
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
                localStorage.setItem('lists', JSON.stringify(list))
                window.location.href = '/'
            })
    }

    const steps = [
        {
            title: 'Concurrentアカウントを作成しましょう！',
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
            title: 'あなたのID',
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
            title: 'シークレットコード',
            component: (
                <SecretCode
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
            title: 'シークレットコードの確認',
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
            title: 'ドメインの選択',
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
            title: 'プロフィールの作成',
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
            title: '準備完了!',
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
                                                    setActiveStep((prevActiveStep) => prevActiveStep - 1)
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
                            <Typography color={theme.palette.background.contrastText}>
                                もうアカウントを持っている？
                            </Typography>
                            <Button variant="contained" component={Link} to="/import">
                                アカウントのインポート
                            </Button>
                        </Box>
                    )}
                </Box>
            </ApiProvider>
        </ThemeProvider>
    )
}
