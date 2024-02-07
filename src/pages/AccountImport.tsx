import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../utils/lang-ja'
import { Client, LoadKey, CommputeCCID, IsValid256k1PrivateKey } from '@concurrent-world/client'
import type { ConcurrentTheme } from '../model'
import { usePersistent } from '../hooks/usePersistent'
import { Themes, loadConcurrentTheme } from '../themes'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline, IconButton, InputAdornment, darken } from '@mui/material'
import { ConcurrentWordmark } from '../components/theming/ConcurrentWordmark'
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

    const [secretInput, setSecretInput] = useState<string>('')
    const [showSecret, setShowSecret] = useState<boolean>(true)
    const [domainInput, setDomainInput] = useState<string>('')

    const [suggestFailed, setSuggestFailed] = useState<boolean>(false)
    const [domain, setDomain] = useState<string>('')
    const [properKey, setProperKey] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')

    const primaryKey = useMemo(() => {
        if (secretInput.length === 0) return

        if (IsValid256k1PrivateKey(secretInput)) {
            const key = LoadKey(secretInput)
            if (!key) return
            return key.privatekey
        }

        const normalized = secretInput.trim().normalize('NFKD')
        const split = normalized.split(' ')
        if (split.length !== 12) {
            setErrorMessage(t('invalidSecret'))
        }

        try {
            if (normalized[0].match(/[a-z]/)) {
                const wallet = HDNodeWallet.fromPhrase(normalized)
                return wallet.privateKey.slice(2)
            } else {
                const ja2en = split
                    .map((word) => {
                        const wordIndex = LangJa.wordlist().getWordIndex(word)
                        return LangEn.wordlist().getWord(wordIndex)
                    })
                    .join(' ')
                const wallet = HDNodeWallet.fromPhrase(ja2en)
                return wallet.privateKey.slice(2)
            }
        } catch (e) {
            setErrorMessage(t('invalidSecret'))
            console.log(e)
        }
    }, [secretInput])

    const primaryCCID = useMemo(() => {
        if (!primaryKey) return
        return CommputeCCID(primaryKey)
    }, [primaryKey])

    const legacyKey = useMemo(() => {
        try {
            const normalized = secretInput.trim().normalize('NFKD')
            const split = normalized.split(' ')
            if (split.length !== 12) return

            const wallet = HDNodeWallet.fromPhrase(normalized, undefined, undefined, LangJa.wordlist())
            return wallet.privateKey.slice(2)
        } catch (e) {
            console.error(e)
        }
    }, [secretInput])

    const legacyCCID = useMemo(() => {
        if (!legacyKey) return
        return CommputeCCID(legacyKey)
    }, [legacyKey])

    const properCCID = useMemo(() => {
        if (!properKey) return
        return CommputeCCID(properKey)
    }, [properKey])

    // suggest
    useEffect(() => {
        if (!primaryKey || !primaryCCID) return

        const searchTarget = domainInput || 'hub.concurrent.world'

        const timer = setTimeout(() => {
            setDomain('')
            setProperKey('')
            try {
                const client = new Client(primaryKey, searchTarget, 'stab-client')
                client.api
                    .resolveAddress(primaryCCID)
                    .then((address) => {
                        if (address) {
                            setProperKey(primaryKey)
                            setDomain(address)
                            setErrorMessage('')
                        }
                    })
                    .catch((_) => {
                        if (!legacyKey || !legacyCCID) return
                        client.api
                            .resolveAddress(legacyCCID)
                            .then((address) => {
                                if (address) {
                                    setProperKey(legacyKey)
                                    setDomain(address)
                                    setErrorMessage('')
                                }
                            })
                            .catch((e) => {
                                console.error(e)
                                setSuggestFailed(true)
                                setErrorMessage(t('notFound'))
                            })
                    })
            } catch (e) {
                console.error(e)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [primaryCCID, legacyCCID, domainInput])

    const accountImport = (): void => {
        localStorage.setItem('Domain', JSON.stringify(domain))
        localStorage.setItem('PrivateKey', JSON.stringify(properKey))
        if (secretInput.split(' ').length === 12) {
            localStorage.setItem('Mnemonic', JSON.stringify(secretInput))
        }
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
                        value={secretInput}
                        onChange={(e) => {
                            setSecretInput(e.target.value)
                        }}
                        disabled={!!properKey}
                        onPaste={() => {
                            setShowSecret(false)
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            setShowSecret(!showSecret)
                                        }}
                                        color="primary"
                                    >
                                        {properKey ? (
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
                    {properCCID && (
                        <Typography sx={{ wordBreak: 'break-all' }}>
                            {t('welcome')}: {properCCID}
                        </Typography>
                    )}
                    {suggestFailed && (
                        <>
                            <Divider sx={{ my: '30px' }} />
                            <Typography variant="h3">{t('ドメイン')}</Typography>
                            <TextField
                                placeholder="https://example.tld/"
                                value={domainInput}
                                onChange={(e) => {
                                    setDomainInput(e.target.value)
                                }}
                            />
                        </>
                    )}
                    {errorMessage}
                    <Button disabled={!properCCID} onClick={accountImport}>
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
