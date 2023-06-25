import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { LoadKey } from '../util'
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

    useEffect(() => {
        let privatekey = ''
        let ccid = ''
        if (mnemonic === '') {
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
                return
            }
        }

        const hub = new ConcurrentApiClient(ccid, privatekey, {
            fqdn: 'hub.concurrent.world',
            ccaddr: '',
            role: '',
            pubkey: '',
            cdate: new Date()
        })

        initializeApi(hub)

        console.log(ccid)
        hub.readEntity(ccid).then((entity) => {
            console.log(entity)
            if (!entity) return
            setServer(entity.host || 'hub.concurrent.world')
            setEntityFound(true)
        })
    }, [mnemonic, secret])

    useEffect(() => {
        if (!api) return
        const fqdn = server.replace('https://', '').replace('/', '')
        api.getHostProfile(fqdn).then((e: any) => {
            setHost(e)
        })
        api.readEntity(api.userAddress).then((entity) => {
            setEntityFound(!!entity && entity.ccaddr !== '')
        })

        console.log(fqdn)
    }, [server, api])

    const accountImport = (): void => {
        if (!api) return
        localStorage.setItem('Host', JSON.stringify(host))
        localStorage.setItem('PrivateKey', JSON.stringify(api.privatekey))
        localStorage.setItem('Address', JSON.stringify(api.userAddress))
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
                    <Typography variant="h3">ふっかつの呪文から</Typography>
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
                    <Typography variant="h3">ホストサーバーアドレス</Typography>
                    <TextField
                        placeholder="https://example.tld/"
                        value={server}
                        onChange={(e) => {
                            setServer(e.target.value)
                        }}
                    />
                    <Button disabled={!entityFound} variant="contained" onClick={accountImport}>
                        インポート
                    </Button>
                </Paper>
            </Box>
        </ThemeProvider>
    )
}
