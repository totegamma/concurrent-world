import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import ApiProvider from '../context/ClientContext'
import { Dialog, DialogActions, DialogContent, DialogTitle, Fade, Paper, TextField } from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { jumpToDomainRegistration } from '../util'
import {
    Client,
    type CoreDomain,
    type ProfileSchema,
    LoadKey,
    generateIdentity,
    type Identity,
    ComputeCCID
} from '@concurrent-world/client'
import { RegistrationWelcome } from '../components/Registration/Welcome'
import { ChooseDomain } from '../components/Registration/ChooseDomain'
import { CreateProfile } from '../components/Registration/CreateProfile'
import { RegistrationReady } from '../components/Registration/LetsGo'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { defaultPreference } from '../context/PreferenceContext'
import { GuestBase } from '../components/GuestBase'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../utils/lang-ja'

export function Registration(): JSX.Element {
    const location = useLocation()

    const { t } = useTranslation('', { keyPrefix: 'registration' })
    const [domain, setDomain] = usePersistent<string>('Domain', 'hub.concurrent.world')
    const [client, initializeClient] = useState<Client>()
    const [host, setHost] = useState<CoreDomain | null | undefined>()
    const [identity, setIdentity] = usePersistent<Identity>('CreatedIdentity', generateIdentity())
    const [profile, setProfile] = useState<ProfileSchema | null>(null)

    const activeStep = parseInt(location.hash.replace('#', '')) || 0
    const setActiveStep = (step: number): void => {
        window.location.hash = step.toString()
    }

    const [dialogOpened, setDialogOpen] = useState(false)
    const [manualKey, setManualKey] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const manualIdentity: Identity | null = useMemo(() => {
        const normalized = manualKey.trim().normalize('NFKD')
        const split = normalized.split(' ')
        if (split.length !== 12) {
            setErrorMessage(t('invalidSecret'))
            return null
        }

        try {
            let wallet
            if (normalized[0].match(/[a-z]/)) {
                wallet = HDNodeWallet.fromPhrase(normalized)
                setErrorMessage('')
                return {
                    mnemonic: normalized,
                    privateKey: wallet.privateKey.slice(2),
                    publicKey: wallet.publicKey.slice(2),
                    CCID: ComputeCCID(wallet.publicKey.slice(2))
                }
            } else {
                const ja2en = split
                    .map((word) => {
                        const wordIndex = LangJa.wordlist().getWordIndex(word)
                        return LangEn.wordlist().getWord(wordIndex)
                    })
                    .join(' ')
                wallet = HDNodeWallet.fromPhrase(ja2en)
                setErrorMessage('')
                return {
                    mnemonic: ja2en,
                    privateKey: wallet.privateKey.slice(2),
                    publicKey: wallet.publicKey.slice(2),
                    CCID: ComputeCCID(wallet.publicKey.slice(2))
                }
            }
        } catch (e) {
            setErrorMessage(t('invalidSecret'))
            console.log(e)
            return null
        }
    }, [manualKey])

    useEffect(() => {
        Client.create(identity.privateKey, domain).then((client) => {
            initializeClient(client)
        })
    }, [])

    useEffect(() => {
        if (activeStep !== 0) return
        const newIdentity = generateIdentity()
        setIdentity(newIdentity)
    }, [activeStep])

    useEffect(() => {
        if (!host) return
        setDomain(host.fqdn)
        const keyPair = LoadKey(identity.privateKey)
        if (!keyPair) return
        const api = new Client(host.fqdn, keyPair, identity.CCID)
        initializeClient(api)
    }, [host])

    const setupAccount = (): void => {
        if (!client) return
        if (!host) return
        localStorage.setItem('Domain', JSON.stringify(host.fqdn))
        localStorage.setItem('PrivateKey', JSON.stringify(identity.privateKey))
        localStorage.setItem('Mnemonic', JSON.stringify(identity.mnemonic))

        console.log('hostAddr', host.ccid)

        const storage = JSON.stringify(defaultPreference)
        client.api.writeKV('world.concurrent.preference', storage)

        window.location.href = '/'
    }

    const steps = [
        {
            title: t('welcome.title'),
            component: (
                <RegistrationWelcome
                    identity={identity}
                    manualSetup={() => {
                        const fqdn = 'hub.concurrent.world'
                        client?.api.getDomain(fqdn).then((e) => {
                            if (!e) return
                            setHost(e)
                            setDomain(e.fqdn)
                            jumpToDomainRegistration(identity.CCID, identity.privateKey, 'hub.concurrent.world')
                        })
                    }}
                    customSetup={() => {
                        setActiveStep(1)
                    }}
                />
            )
        },
        {
            title: t('chooseDomain.title'),
            component: (
                <ChooseDomain
                    identity={identity}
                    next={() => {
                        setActiveStep(2)
                    }}
                    client={client}
                    host={host}
                    setHost={setHost}
                />
            )
        },
        {
            title: t('createProfile.title'),
            component: (
                <CreateProfile
                    next={() => {
                        setActiveStep(3)
                    }}
                    client={client}
                />
            )
        },
        {
            title: t('ready.title'),
            component: (
                <RegistrationReady
                    identity={identity}
                    next={() => {
                        setupAccount()
                    }}
                    host={host}
                    profile={profile}
                />
            )
        }
    ]

    if (!client) return <>api constructing...</>

    return (
        <GuestBase
            sx={{
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: 2
            }}
            additionalButton={
                <Button component={Link} to="/import">
                    {t('importAccount')}
                </Button>
            }
        >
            <ApiProvider client={client}>
                <>
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
                                width: '100%',
                                position: 'absolute',
                                justifyContent: 'space-between',
                                bottom: 0,
                                p: 1
                            }}
                        >
                            <Box />
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setDialogOpen(true)
                                }}
                            >
                                キーを手動で指定する
                            </Button>
                        </Box>
                    </Paper>
                    <Dialog
                        open={dialogOpened}
                        onClose={() => {
                            setDialogOpen(false)
                        }}
                    >
                        <DialogTitle>キーを手動で指定する</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="キー"
                                value={manualKey}
                                onChange={(e) => {
                                    setManualKey(e.target.value)
                                }}
                                fullWidth
                            />
                            {errorMessage}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                            >
                                閉じる
                            </Button>
                            <Button
                                type="submit"
                                disabled={!manualIdentity}
                                onClick={() => {
                                    if (!manualIdentity) return
                                    setIdentity(manualIdentity)
                                    setDialogOpen(false)
                                }}
                            >
                                決定
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            </ApiProvider>
        </GuestBase>
    )
}
