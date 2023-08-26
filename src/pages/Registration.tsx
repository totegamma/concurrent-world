import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import muiLink from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import { ProfileEditor } from '../components/ProfileEditor'
import ApiProvider from '../context/api'
import type { ConcurrentTheme } from '../model'
import { IssueJWT } from '@concurrent-world/client'
import {
    Alert,
    AlertTitle,
    Avatar,
    CssBaseline,
    Fade,
    Grid,
    IconButton,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    ThemeProvider,
    darken
} from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, createConcurrentTheme } from '../themes'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../components/theming/Passport'
import { CCAvatar } from '../components/ui/CCAvatar'
import { generateIdentity } from '../util'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'

import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
    Client,
    type RawDomainProfile,
    type Profile,
    Schemas,
    type CoreCharacter,
    type CoreDomain
} from '@concurrent-world/client'

export function Registration(): JSX.Element {
    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue2')
    const [theme, setTheme] = useState<ConcurrentTheme>(createConcurrentTheme(themeName))

    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(createConcurrentTheme(newThemeName))
    }

    const navigate = useNavigate()
    const [activeStep, setActiveStep] = useState(0)
    const [mnemonicTest, setMnemonicTest] = useState<string>('')
    const [profile, setProfile] = useState<Profile>()

    const [mnemonic, setMnemonic] = useState<string>('')
    const [CCID, setCCID] = useState<string>('')
    const [privateKey, setPrivateKey] = useState<string>('')
    const [client, initializeClient] = useState<Client>()

    useEffect(() => {
        const identity = generateIdentity()
        setMnemonic(identity.mnemonic)
        setCCID(identity.CCID)
        setPrivateKey(identity.privateKey)
        initializeClient(new Client(identity.privateKey, 'hub.concurrent.world'))
    }, [])

    const [server, setServer] = useState<string>('')
    const [host, setHost] = useState<CoreDomain | null | undefined>()
    const [entityFound, setEntityFound] = useState<boolean>(false)

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
                navigate('/')
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
                navigate('/')
            })
    }

    const checkRegistration = async (): Promise<void> => {
        console.log('check!!!')
        client?.api.invalidateEntity(CCID)
        const entity = await client?.api.readEntity(CCID)
        console.log(entity)
        setEntityFound(!!entity && entity.ccid != null)
    }

    const steps = [
        {
            title: 'Concurrentアカウントを作成しましょう！',
            component: (
                <>
                    <Box
                        sx={{
                            padding: '30px',
                            maxWidth: '600px',
                            margin: 'auto'
                        }}
                    >
                        <Tilt glareEnable={true} glareBorderRadius="5%">
                            <PassportRenderer
                                theme={theme}
                                ccid={CCID}
                                name={''}
                                avatar={''}
                                host={''}
                                cdate={''}
                                trust={0}
                            />
                        </Tilt>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={(): void => {
                                setActiveStep(1)
                            }}
                        >
                            IDカードを作成する
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '10px',
                            alignItems: 'center',
                            position: 'absolute',
                            right: '10px',
                            bottom: '10px'
                        }}
                    >
                        <Typography>もうアカウントを持っている？</Typography>
                        <Button variant="contained" component={Link} to="/import">
                            アカウントのインポート
                        </Button>
                    </Box>
                </>
            )
        },
        {
            title: 'あなたのID',
            component: (
                <Box
                    sx={{
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                padding: '10px',
                                fontWeight: 'bold',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <CCAvatar identiconSource={CCID} />
                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: '0.9rem',
                                        sm: '1rem'
                                    }
                                }}
                            >
                                {CCID}
                            </Typography>
                        </Paper>
                        <Typography>これは、Concurrentの世界であなたを特定する文字列です。</Typography>
                        <Divider />
                        <Typography>
                            次に、あなたがこのIDの持ち主であることを証明するためのシークレットコードを作成します。
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={(): void => {
                                setActiveStep(2)
                            }}
                        >
                            Next: IDのシークレットコードの作成
                        </Button>
                    </Box>
                </Box>
            )
        },
        {
            title: 'シークレットコード',
            component: (
                <Box
                    sx={{
                        display: 'flex',
                        gap: '15px',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Paper
                        variant="outlined"
                        component={Grid}
                        style={{
                            width: '100%',
                            margin: 1
                        }}
                        spacing={1}
                        columns={4}
                        container
                    >
                        {mnemonic.split('　').map((e, i) => (
                            <Grid
                                key={i}
                                item
                                xs={2}
                                sm={1}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '5px',
                                    padding: '5px'
                                }}
                            >
                                {i + 1}:
                                <Paper
                                    variant="outlined"
                                    sx={{ display: 'inline-block', padding: '5px', width: '100%', textAlign: 'center' }}
                                >
                                    {e}
                                </Paper>
                            </Grid>
                        ))}
                    </Paper>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigator.clipboard.writeText(mnemonic)
                        }}
                        startIcon={<ContentPasteIcon />}
                    >
                        シークレットコードをコピー
                    </Button>
                    <Typography>
                        シークレットコードは、あなたが再ログインしたいとき、別の端末からログインしたいときに必要な呪文です。
                    </Typography>
                    <Typography>
                        <b>絶対に紛失しないように</b>そして、
                        <b>絶対に誰にも知られないように</b>してください。
                    </Typography>
                    <Typography>
                        紛失すると、二度とあなたのアカウントにアクセスできなくなります。
                        また、他人に知られると、あなたのアカウントがハッカーとの共有アカウントになってしまいます。
                    </Typography>
                    <Typography>メモを取りましたか？</Typography>
                    <Button
                        variant="contained"
                        onClick={(): void => {
                            setActiveStep(3)
                        }}
                    >
                        Next: シークレットコードの確認
                    </Button>
                </Box>
            )
        },
        {
            title: 'シークレットコードの確認',
            component: (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}
                >
                    <TextField
                        placeholder="12個の単語からなる呪文"
                        value={mnemonicTest}
                        onChange={(e) => {
                            setMnemonicTest(e.target.value)
                        }}
                        sx={{
                            width: '100%'
                        }}
                    />
                    {mnemonic === mnemonicTest ? '一致しています' : '一致していません'}
                    <Button
                        variant="contained"
                        disabled={mnemonic !== mnemonicTest}
                        onClick={(): void => {
                            setActiveStep(4)
                        }}
                    >
                        Next: ドメインの選択
                    </Button>
                </Box>
            )
        },
        {
            title: 'ドメインの選択',
            component: (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}
                >
                    <Typography>
                        あなたのメッセージを保存・配信してくれるドメインを探しましょう。
                        <br />
                        どのドメインを選択しても、だれとでもつながる事ができます。
                        <br />
                        また、(鯖管が頑張れば)いつでも別のドメインに移行する事ができます。
                    </Typography>
                    <Alert severity="info">
                        <AlertTitle>ここで一度concurrent.worldからドメイン管轄サイトへ移動します</AlertTitle>
                        ドメインでのアカウント作成後、またこのページに戻ってくる必要があります。このタブを閉じないでください。
                    </Alert>
                    <Box width="100%" display="flex" flexDirection="column">
                        <Typography variant="h3">リストから選択</Typography>
                        <List>
                            <ListItemButton
                                component={Link}
                                to={`https://hub.concurrent.world/web/register?token=${
                                    IssueJWT(privateKey, { iss: CCID, aud: 'hub.concurrent.world' }) ?? ''
                                }`}
                                target="_blank"
                                onClick={() => {
                                    setServer('hub.concurrent.world')
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar></Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="hub.concurrent.world" />
                                <ListItemIcon>
                                    <OpenInNewIcon />
                                </ListItemIcon>
                            </ListItemButton>
                        </List>
                        <Divider>または</Divider>
                        <Typography variant="h3">URLから直接入力</Typography>
                        <Typography
                            color="text.primary"
                            component={muiLink}
                            variant="caption"
                            href="https://github.com/totegamma/concurrent"
                            target="_blank"
                        >
                            Tips: 自分でサーバーを建てる場合はこちら
                        </Typography>
                        <Box flex="1" />
                        <Box sx={{ display: 'flex', gap: '10px' }}>
                            <TextField
                                placeholder="concurrent.example.tld"
                                value={server}
                                onChange={(e) => {
                                    setServer(e.target.value)
                                }}
                                sx={{
                                    flex: 1
                                }}
                            />
                            <Button
                                variant="contained"
                                component={Link}
                                to={
                                    'http://' +
                                    (host?.fqdn ?? '') +
                                    '/web/register?token=' +
                                    (IssueJWT(privateKey, { iss: CCID, aud: host?.fqdn }) ?? '')
                                }
                                target="_blank"
                                disabled={!host}
                            >
                                登録ページへ
                            </Button>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        disabled={!host}
                        onClick={() => {
                            checkRegistration()
                        }}
                    >
                        ドメインの登録状況を確認
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!entityFound}
                        onClick={(): void => {
                            setActiveStep(5)
                        }}
                    >
                        Next: プロフィールの作成
                    </Button>
                </Box>
            )
        },
        {
            title: 'プロフィールの作成',
            component: (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}
                >
                    ここで名前・アイコン・自己紹介を設定します。
                    <Box
                        sx={{
                            width: '100%',
                            borderRadius: 1,
                            overflow: 'hidden'
                        }}
                    >
                        <ProfileEditor
                            onSubmit={(newprofile) => {
                                setProfile(newprofile)
                                client?.setupUserstreams().then(() => {
                                    setActiveStep(6)
                                })
                            }}
                        />
                    </Box>
                </Box>
            )
        },
        {
            title: '準備完了!',
            component: (
                <>
                    <Box
                        sx={{
                            padding: '30px',
                            maxWidth: '600px',
                            margin: 'auto'
                        }}
                    >
                        <Tilt glareEnable={true} glareBorderRadius="5%">
                            <PassportRenderer
                                theme={theme}
                                ccid={CCID}
                                name={profile?.username ?? ''}
                                avatar={profile?.avatar ?? ''}
                                host={host?.fqdn ?? ''}
                                cdate={new Date().toLocaleDateString()}
                                trust={0}
                            />
                        </Tilt>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px'
                        }}
                    >
                        <Button variant="contained" onClick={setupAccount}>
                            はじめる
                        </Button>
                    </Box>
                </>
            )
        }
    ]

    if (!client) return <>api constructing...</>

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ApiProvider api={client}>
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
