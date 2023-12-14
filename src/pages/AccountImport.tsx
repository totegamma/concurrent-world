import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../utils/lang-ja'
import { Client, LoadKey, type CoreDomain, CommputeCCID } from '@concurrent-world/client'
import type { ConcurrentTheme } from '../model'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, loadConcurrentTheme } from '../themes'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline, IconButton, InputAdornment, darken } from '@mui/material'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
import { IsValid256k1PrivateKey } from '@concurrent-world/client'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTranslation } from 'react-i18next'

export function AccountImport(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'import' })

    const [themeName, setThemeName] = usePersistent<string>('Theme', 'blue2')
    const [theme, setTheme] = useState<ConcurrentTheme>(loadConcurrentTheme(themeName))

    const themes: string[] = Object.keys(Themes)
    const randomTheme = (): void => {
        const box = themes.filter((e) => e !== themeName)
        const newThemeName = box[Math.floor(Math.random() * box.length)]
        setThemeName(newThemeName)
        setTheme(loadConcurrentTheme(newThemeName))
    }

    const [secret, setSecret] = useState<string>('')
    const [mnemonic, setMnemonic] = useState<string>('')
    const [server, setServer] = useState<string>('')
    const [host, setHost] = useState<CoreDomain>()
    const [entityFound, setEntityFound] = useState<boolean>(false)
    const [client, initializeClient] = useState<Client>()
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [suggestFailed, setSuggestFailed] = useState<boolean>(false)
    const [showSecret, setShowSecret] = useState<boolean>(false)

    const [privatekey, setPrivatekey] = useState<string>('')
    const [ccid, setCcid] = useState<string>('')

    const [legacySearched, setLegacySearched] = useState<boolean>(false)

    useEffect(() => {
        if (!privatekey) return
        const key = LoadKey(privatekey)
        if (!key) return
        const ccid = CommputeCCID(key.publickey)
        setCcid(ccid)

        setErrorMessage(t('searching'))
        const hubClient = new Client(privatekey, 'hub.concurrent.world', 'stab-client')
        hubClient.api
            .readEntity(ccid)
            .then((entity) => {
                console.log(entity)
                if (entity && entity.ccid === ccid) {
                    setServer(entity.domain || 'hub.concurrent.world')
                    setEntityFound(true)
                } else {
                    setErrorMessage(t('notFound'))
                    setSuggestFailed(true)
                }
            })
            .catch((e) => {
                console.log(e)

                if (!legacySearched) {
                    // try legacy
                    console.log('try legacy')

                    const normalized = secret.trim().normalize('NFKD')
                    console.log(normalized)
                    const wallet = HDNodeWallet.fromPhrase(normalized, undefined, undefined, LangJa.wordlist())
                    setMnemonic(normalized)
                    setPrivatekey(wallet.privateKey.slice(2))

                    setLegacySearched(true)
                    return
                }

                setErrorMessage(t('notFound'))
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

        const normalized = secret.trim().normalize('NFKD')
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
                const ja2en = split
                    .map((word) => {
                        const wordIndex = LangJa.wordlist().getWordIndex(word)
                        return LangEn.wordlist().getWord(wordIndex)
                    })
                    .join(' ')
                const wallet = HDNodeWallet.fromPhrase(ja2en)
                setMnemonic(normalized)
                setPrivatekey(wallet.privateKey.slice(2))
            }
        } catch (e) {
            console.log(e)
        }

        setErrorMessage(t('invalidSecret'))
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
                                setErrorMessage(t('notFoundOnServer'))
                                return
                            }
                            setErrorMessage('')
                            setEntityFound(entity.ccid === client.ccid)
                            initializeClient(client)
                        })
                        .catch((_) => {
                            if (unmounted) return
                            setErrorMessage(t('notFoundOnServer'))
                        })
                    console.log(fqdn)
                })
                .catch((_) => {
                    if (unmounted) return
                    setErrorMessage(t('connectError'))
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
                        flexDirection: 'column',
                        width: '100%',
                        padding: '20px',
                        flex: 1,
                        gap: '20px'
                    }}
                >
                    <Typography variant="h3">{t('input')}</Typography>
                    <TextField
                        type={showSecret ? 'text' : 'password'}
                        placeholder={t('secretPlaceholder')}
                        value={secret}
                        onChange={(e) => {
                            setSecret(e.target.value)
                        }}
                        disabled={!!privatekey}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            setShowSecret(!showSecret)
                                        }}
                                        color="primary"
                                    >
                                        {privatekey ? (
                                            <CheckCircleIcon />
                                        ) : showSecret ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    {ccid && (
                        <Typography sx={{ wordBreak: 'break-all' }}>
                            {t('welcome')}: {ccid}
                        </Typography>
                    )}
                    {suggestFailed && (
                        <>
                            <Divider sx={{ my: '30px' }} />
                            <Typography variant="h3">{t('ドメイン')}</Typography>
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
                    <Button disabled={!entityFound} onClick={accountImport}>
                        {t('import')}
                    </Button>
                </Paper>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        gap: '10px',
                        alignItems: 'center'
                    }}
                >
                    <Typography color="background.contrastText">{t('noAccount')}</Typography>
                    <Button component={Link} to="/register">
                        {t('createAccount')}
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    )
}
