import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import {
    Client,
    LoadKey,
    ComputeCCID,
    IsValid256k1PrivateKey,
    type KeyPair,
    LoadKeyFromMnemonic,
    LoadIdentity
} from '@concurrent-world/client'
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
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [registrationOK, setRegistrationOK] = useState<boolean>(false)

    const keypair: KeyPair | null = useMemo(() => {
        if (secretInput.length === 0) return null
        if (IsValid256k1PrivateKey(secretInput)) return LoadKey(secretInput)

        return LoadKeyFromMnemonic(secretInput)
    }, [secretInput])

    const ccid = useMemo(() => {
        if (!keypair) return ''
        return ComputeCCID(keypair.publickey)
    }, [keypair])

    // suggest
    useEffect(() => {
        if (!keypair || !ccid) return
        const searchTarget = 'ariake.concrnt.net'

        const timer = setTimeout(() => {
            try {
                const client = new Client(searchTarget, keypair, ccid)
                client.api
                    .getEntity(ccid, searchTarget)
                    .then((entity) => {
                        if (entity?.domain) {
                            setDomainInput(entity.domain)
                            setErrorMessage('')
                        } else {
                            setErrorMessage(t('notFound'))
                        }
                    })
                    .catch((_) => {
                        setErrorMessage(t('notFound'))
                    })
            } catch (e) {
                console.error(e)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
        }
    }, [keypair])

    useEffect(() => {
        if (!domainInput || !keypair || !ccid) return
        const timer = setTimeout(() => {
            try {
                const client = new Client(domainInput, keypair, ccid)
                client.api.fetchWithCredential(domainInput, '/api/v1/entity', {}).then((res) => {
                    if (res.ok) {
                        setRegistrationOK(true)
                    } else {
                        setRegistrationOK(false)
                    }
                })
            } catch (e) {
                console.error(e)
            }
        }, 300)
        return () => {
            clearTimeout(timer)
        }
    }, [domainInput])

    const accountImport = (): void => {
        localStorage.setItem('Domain', JSON.stringify(domainInput))
        localStorage.setItem('PrivateKey', JSON.stringify(keypair?.privatekey))
        const normalized = secretInput.trim().normalize('NFKD')
        if (normalized.split(' ').length === 12) {
            localStorage.setItem('Identity', JSON.stringify(LoadIdentity(normalized)))
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
                disabled={!!keypair}
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
                                {keypair ? <CheckCircleIcon /> : showSecret ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            {keypair && (
                <Typography sx={{ wordBreak: 'break-all' }}>
                    {t('welcome')}: {ccid}
                </Typography>
            )}
            <TextField
                placeholder="example.tld"
                label={t('domain')}
                value={domainInput}
                onChange={(e) => {
                    setDomainInput(e.target.value)
                }}
            />
            {errorMessage}
            <Button disabled={!keypair || !registrationOK} onClick={accountImport}>
                {t('import')}
            </Button>
        </>
    )
}
