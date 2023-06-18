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
import { darken } from '@mui/material'
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
        if (mnemonic === '') {
            const key = LoadKey(secret)
            if (!key) return
            const api = new ConcurrentApiClient(key.ccaddress, key.privatekey, host)
            initializeApi(api)
        } else {
            const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, undefined, LangJa.wordlist()) // TODO: move to utils
            const api = new ConcurrentApiClient('CC' + wallet.address.slice(2), wallet.privateKey.slice(2), host)
            initializeApi(api)
        }
    }, [mnemonic, secret, host])

    useEffect(() => {
        if (!api) return
        const fqdn = server.replace('https://', '').replace('/', '')
        api.getHostProfile(fqdn).then((e: any) => {
            setHost(e)
        })
        console.log(fqdn)
    }, [server])

    useEffect(() => {
        console.log('check!!!')
        api?.readEntity(api.userAddress).then((entity) => {
            setEntityFound(!!entity && entity.ccaddr !== '')
        })
    }, [api])

    const accountImport = (): void => {
        if (!api) return
        localStorage.setItem('Host', JSON.stringify(host))
        localStorage.setItem('PrivateKey', JSON.stringify(api.privatekey))
        localStorage.setItem('Address', JSON.stringify(api.userAddress))
        navigate('/')
    }

    return (
        <ThemeProvider theme={theme}>
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
