import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import ApiProvider from '../context/api'
import type { ConcurrentTheme } from '../model'
import {
    CssBaseline,
    Fade,
    IconButton,
    Paper,
    ThemeProvider,
    darken
} from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, createConcurrentTheme } from '../themes'
import { generateIdentity } from '../util'
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

export function Registration(): JSX.Element {
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue')
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))
    const [activeStep, setActiveStep] = useState(0)
    const [profile, setProfile] = useState<Profile>()
    const [mnemonic, setMnemonic] = useState<string>('')
    const [CCID, setCCID] = useState<string>('')
    const [privateKey, setPrivateKey] = useState<string>('')
    const [client, initializeClient] = useState<Client>()
    const [server, setServer] = useState<string>('')
    const [host, setHost] = useState<CoreDomain | null | undefined>()


    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(createConcurrentTheme(newThemeName))
    }

    useEffect(() => {
        const identity = generateIdentity()
        setMnemonic(identity.mnemonic)
        setCCID(identity.CCID)
        setPrivateKey(identity.privateKey)
        initializeClient(new Client(identity.privateKey, 'hub.concurrent.world'))
    }, [])

    useEffect(() => {
        if (!CCID || !privateKey || !host) return
        const api = new Client(privateKey, host.fqdn)
        initializeClient(api)
    }, [host, CCID, privateKey])

    useEffect(() => {
        let unmounted = false
        if (!client) return
        const fqdn = server.replace('https://', '').replace('/', '')
        client.api.readDomain(fqdn).then((e) => {
            if (unmounted) return
            setHost(e)
        })
        console.log(fqdn)
        return () => {
            unmounted = true
        }
    }, [server])

    const setupAccount = (): void => {
        if (!client) return
        if (!host) return
        localStorage.setItem('Domain', JSON.stringify(host.fqdn))
        localStorage.setItem('PrivateKey', JSON.stringify(privateKey))
        localStorage.setItem('Mnemonic', JSON.stringify(mnemonic))

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
            component: <RegistrationWelcome
                next={() => setActiveStep(1)}
            />
        },
        {
            title: 'あなたのID',
            component: <YourID
                next={() => setActiveStep(2)}
            />
        },
        {
            title: 'シークレットコード',
            component: <SecretCode
                next={() => setActiveStep(3)}
            />
        },
        {
            title: 'シークレットコードの確認',
            component: <VerifyCode
                next={() => setActiveStep(4)}
            />
        },
        {
            title: 'ドメインの選択',
            component: <ChooseDomain
                next={() => setActiveStep(5)}
            />
        },
        {
            title: 'プロフィールの作成',
            component: <CreateProfile
                next={() => setActiveStep(6)}
            />
        },
        {
            title: '準備完了!',
            component: <RegistrationReady
                next={() => setupAccount()}
            />
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
                </Box>
            </ApiProvider>
        </ThemeProvider>
    )
}
