import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HDNodeWallet } from 'ethers'
import { LangJa } from '../utils/lang-ja'
import { Client, LoadKey, type CoreDomain, CommputeCCID } from '@concurrent-world/client'
import type { ConcurrentTheme } from '../model'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, createConcurrentTheme } from '../themes'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline, darken } from '@mui/material'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import { IsValid256k1PrivateKey } from '@concurrent-world/client'

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

    const [secret, setSecret] = useState<string>('')
    const [mnemonic, setMnemonic] = useState<string>('')
    const [server, setServer] = useState<string>('')
    const [host, setHost] = useState<CoreDomain>()
    const [entityFound, setEntityFound] = useState<boolean>(false)
    const [client, initializeClient] = useState<Client>()
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [suggestFailed, setSuggestFailed] = useState<boolean>(false)

    const [privatekey, setPrivatekey] = useState<string>('')

    useEffect(() => {
        if (!privatekey) return
        const key = LoadKey(privatekey)
        if (!key) return
        const ccid = CommputeCCID(key.publickey)

        setErrorMessage('検索中...')
        const hubClient = new Client(privatekey, 'hub.concurrent.world', 'stab-client')
        hubClient.api
            .readEntity(ccid)
            .then((entity) => {
                console.log(entity)
                if (entity && entity.ccid === ccid) {
                    setServer(entity.domain || 'hub.concurrent.world')
                    setEntityFound(true)
                } else {
                    setErrorMessage('お住まいのサーバーが見つかりませんでした。手動入力することで継続できます。')
                    setSuggestFailed(true)
                }
            })
            .catch((e) => {
                console.log(e)
                setErrorMessage('お住まいのサーバーが見つかりませんでした。手動入力することで継続できます。')
                setSuggestFailed(true)
            })
    }, [privatekey])

    useEffect(() => {
        setServer('')
        setErrorMessage('')
        setEntityFound(false)
        if (secret.length === 0) return

        // try to parse as private key
        if (IsValid256k1PrivateKey(secret)) {
            const key = LoadKey(secret)
            if (!key) return
            setPrivatekey(key.privatekey)
            return
        }

        const normalized = secret.trim().normalize().replaceAll('　', ' ')
        const split = normalized.split(' ')
        console.log(split)
        if (split.length !== 12) return

        // try to parse as mnemonic
        try {
            if (normalized[0].match(/[a-z]/)) {
                console.log('english')
                const wallet = HDNodeWallet.fromPhrase(normalized)
                setMnemonic(normalized)
                setPrivatekey(wallet.privateKey.slice(2))
            } else {
                console.log('japanese')
                const wallet = HDNodeWallet.fromPhrase(normalized, undefined, undefined, LangJa.wordlist())
                setMnemonic(normalized)
                setPrivatekey(wallet.privateKey.slice(2))
            }
        } catch (e) {
            console.log(e)
        }

        setErrorMessage('シークレットコードが正しくありません。')
    }, [secret])

    useEffect(() => {
        let unmounted = false
        const fqdn = server.replace('https://', '').replace('/', '')
        try {
            const client = new Client(privatekey, fqdn)
            client.api
                .readDomain(fqdn)
                .then((e: any) => {
                    if (unmounted) return
                    setHost(e)
                    client.api
                        .readEntity(client.ccid)
                        .then((entity) => {
                            if (unmounted) return
                            console.log(entity)
                            if (!entity || entity.ccid !== client.ccid) {
                                setErrorMessage('指定のサーバーにあなたのアカウントは見つかりませんでした。')
                                return
                            }
                            setErrorMessage('')
                            setEntityFound(entity.ccid === client.ccid)
                            initializeClient(client)
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
        } catch (e) {
            console.log(e)
            return
        }
        return () => {
            unmounted = true
        }
    }, [server])

    const accountImport = (): void => {
        if (!client) return
        if (!host) return
        localStorage.setItem('Domain', JSON.stringify(host.fqdn))
        localStorage.setItem('PrivateKey', JSON.stringify(client.api.privatekey))
        localStorage.setItem('Mnemonic', JSON.stringify(mnemonic))
        window.location.href = '/'
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
                    <Typography variant="h3">シークレットコードまたは秘密鍵を入力</Typography>
                    <TextField
                        placeholder="12個の単語からなる呪文"
                        value={secret}
                        onChange={(e) => {
                            setSecret(e.target.value)
                        }}
                        disabled={!!privatekey}
                    />
                    {suggestFailed && (
                        <>
                            <Divider sx={{ my: '30px' }} />
                            <Typography variant="h3">ドメイン</Typography>
                            <TextField
                                placeholder="https://example.tld/"
                                value={server}
                                onChange={(e) => {
                                    setServer(e.target.value)
                                }}
                            />
                        </>
                    )}
                    {errorMessage}
                    <Button disabled={!entityFound} variant="contained" onClick={accountImport}>
                        インポート
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            alignItems: 'center'
                        }}
                    >
                        <Typography>まだアカウントを作ってない？</Typography>
                        <Button variant="contained" component={Link} to="/register">
                            アカウントを作成
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </ThemeProvider>
    )
}
