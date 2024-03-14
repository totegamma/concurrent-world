import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../../utils/lang-ja'
import { Client, LoadKey, ComputeCCID, IsValid256k1PrivateKey } from '@concurrent-world/client'
import { IconButton, InputAdornment } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTranslation } from 'react-i18next'

export function ImportMasterKey(): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'import' })

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
        return ComputeCCID(primaryKey)
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
        return ComputeCCID(legacyKey)
    }, [legacyKey])

    const properCCID = useMemo(() => {
        if (!properKey) return
        return ComputeCCID(properKey)
    }, [properKey])

    // suggest
    useEffect(() => {
        if (!primaryKey || !primaryCCID) return

        const searchTarget = domainInput || 'hub.concurrent.world'
        const keyPair = LoadKey(primaryKey)
        if (!keyPair) return

        const timer = setTimeout(() => {
            setDomain('')
            setProperKey('')
            try {
                const client = new Client(searchTarget, keyPair, primaryCCID)
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
                        if (!legacyKey || !legacyCCID) {
                            setSuggestFailed(true)
                            setErrorMessage(t('notFound'))
                            return
                        }
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
        const normalized = secretInput.trim().normalize('NFKD')
        if (normalized.split(' ').length === 12) {
            localStorage.setItem('Mnemonic', JSON.stringify(normalized))
        }
        window.location.href = '/'
    }

    return (
        <>
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
                                {properKey ? <CheckCircleIcon /> : showSecret ? <VisibilityOff /> : <Visibility />}
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
        </>
    )
}
