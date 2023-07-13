import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { LoadKey, isValid256k1PrivateKey } from '../util'
import { useNavigate } from 'react-router-dom'
import { HDNodeWallet } from 'ethers'
import { LangJa } from '../utils/lang-ja'
import ConcurrentApiClient from '../apiservice'
import type { ConcurrentTheme, Host } from '../model'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, createConcurrentTheme } from '../themes'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline, darken } from '@mui/material'
import { ConcurrentWordmark } from '../components/ConcurrentWordmark'

export function AccountImport(): JSX.Element {
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
    const [mnemonic, setMnemonic] = useState<string>('')
    const [secret, setSecret] = useState<string>('')
    const [server, setServer] = useState<string>('')
    const [host, setHost] = useState<Host>()
    const [entityFound, setEntityFound] = useState<boolean>(false)
    const [api, initializeApi] = useState<ConcurrentApiClient>()
    const [errorMessage, setErrorMessage] = useState<string>('')

    const [privatekey, setPrivatekey] = useState<string>('')
    const [ccid, setCcid] = useState<string>('')

    useEffect(() => {
        let privatekey = ''
        let ccid = ''
        setServer('')
        setErrorMessage('')
        setEntityFound(false)
        if (mnemonic === '') {
            if (!isValid256k1PrivateKey(secret)) {
                setErrorMessage('秘密鍵の要件を満たしていません。秘密鍵でないか入力に誤りがあります。')
                return
            }
            const key = LoadKey(secret)
            if (!key) return
            privatekey = key.privatekey
            ccid = key.ccaddress
        } else {
            try {
                const wallet = HDNodeWallet.fromPhrase(mnemonic.trim(), undefined, undefined, LangJa.wordlist()) // TODO: move to utils
                privatekey = wallet.privateKey.slice(2)
                ccid = 'CC' + wallet.address.slice(2)
            } catch (e) {
                console.log(e)
                setErrorMessage('シークレットコードが正しくありません。')
                return
            }
        }

        setPrivatekey(privatekey)
        setCcid(ccid)

        const hubApi = new ConcurrentApiClient(ccid, privatekey, 'hub.concurrent.world')

        hubApi.readEntity(ccid).then((entity) => {
            console.log(entity)
            if (entity && entity.ccaddr === ccid) {
                setServer(entity.host || 'hub.concurrent.world')
                setEntityFound(true)
            } else {
                setErrorMessage('お住まいのサーバーが見つかりませんでした。手動入力することで継続できます。')
            }
        })
    }, [mnemonic, secret])

    useEffect(() => {
        let unmounted = false
        const fqdn = server.replace('https://', '').replace('/', '')
        const api = new ConcurrentApiClient(ccid, privatekey, fqdn)
        api.getHostProfile(fqdn)
            .then((e: any) => {
                if (unmounted) return
                setHost(e)
                api.readEntity(api.userAddress)
                    .then((entity) => {
                        if (unmounted) return
                        console.log(entity)
                        if (!entity || entity.ccaddr !== api.userAddress) {
                            setErrorMessage('指定のサーバーにあなたのアカウントは見つかりませんでした。')
                            return
                        }
                        setErrorMessage('')
                        setEntityFound(entity.ccaddr === api.userAddress)
                        initializeApi(api)
                    })
                    .catch((_) => {
                        if (unmounted) return
                        setErrorMessage('指定のサーバーにあなたのアカウントは見つかりませんでした。')
                    })
                console.log(fqdn)
            })
            .catch((_) => {
                if (unmounted) return
                setErrorMessage('指定のサーバーに接続できませんでした。')
            })
        return () => {
            unmounted = true
        }
    }, [server])

    const accountImport = (): void => {
        if (!api) return
        if (!host) return
        localStorage.setItem('Domain', JSON.stringify(host.fqdn))
        localStorage.setItem('PrivateKey', JSON.stringify(api.privatekey))
        localStorage.setItem('Address', JSON.stringify(api.userAddress))
        localStorage.setItem('Mnemonic', JSON.stringify(mnemonic))
        navigate('/')
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
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
                        flexDirection: 'column',
                        width: '100%',
                        padding: '20px',
                        flex: 1,
                        gap: '20px'
                    }}
                >
                    <Typography variant="h3">シークレットコードから</Typography>
                    <TextField
                        placeholder="12個の単語からなる呪文"
                        value={mnemonic}
                        onChange={(e) => {
                            setMnemonic(e.target.value)
                        }}
                    />
                    <Box>
                        <Divider>または</Divider>
                    </Box>
                    <Typography variant="h3">秘密鍵を直接入力</Typography>
                    <TextField
                        placeholder="0x..."
                        value={secret}
                        onChange={(e) => {
                            setSecret(e.target.value)
                        }}
                    />
                    <Divider sx={{ my: '30px' }} />
                    <Typography variant="h3">ドメイン</Typography>
                    <TextField
                        placeholder="https://example.tld/"
                        value={server}
                        onChange={(e) => {
                            setServer(e.target.value)
                        }}
                    />
                    {errorMessage}
                    <Button disabled={!entityFound} variant="contained" onClick={accountImport}>
                        インポート
                    </Button>
                </Paper>
            </Box>
        </ThemeProvider>
    )
}
