import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import ApiProvider from '../context/ClientContext'
import { Fade, Paper } from '@mui/material'
import { usePersistent } from '../hooks/usePersistent'
import { type Identity, generateIdentity, jumpToDomainRegistration } from '../util'
import {
    Client,
    Schemas,
    type CoreCharacter,
    type CoreDomain,
    type ProfileSchema,
    type DomainProfileSchema,
    LoadKey
} from '@concurrent-world/client'
import { RegistrationWelcome } from '../components/Registration/Welcome'
import { ChooseDomain } from '../components/Registration/ChooseDomain'
import { CreateProfile } from '../components/Registration/CreateProfile'
import { RegistrationReady } from '../components/Registration/LetsGo'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { defaultPreference } from '../context/PreferenceContext'
import { GuestBase } from '../components/GuestBase'

export function Registration(): JSX.Element {
    const location = useLocation()

    const { t } = useTranslation('', { keyPrefix: 'registration' })
    const [domain, setDomain] = usePersistent<string>('Domain', 'hub.concurrent.world')
    const [client, initializeClient] = useState<Client>()
    const [host, setHost] = useState<CoreDomain | null | undefined>()
    const [identity, setIdentity] = usePersistent<Identity>('CreatedIdentity', generateIdentity())
    const [profile, setProfile] = useState<CoreCharacter<ProfileSchema> | null>(null)

    const activeStep = parseInt(location.hash.replace('#', '')) || 0
    const setActiveStep = (step: number): void => {
        window.location.hash = step.toString()
    }

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
        localStorage.setItem('Mnemonic', JSON.stringify(identity.mnemonic_en))

        console.log('hostAddr', host.ccid)

        client?.api
            .getCharacter<DomainProfileSchema>(host.ccid, Schemas.domainProfile)
            .then((profile: Array<CoreCharacter<DomainProfileSchema>> | null | undefined) => {
                console.log('domainprofile:', profile)
                const domainProfile = profile?.[0]?.payload.body
                const list = {
                    home: {
                        label: 'Home',
                        pinned: true,
                        streams: domainProfile?.defaultFollowingStreams ? domainProfile?.defaultFollowingStreams : [],
                        userStreams: [],
                        expanded: false,
                        defaultPostStreams: domainProfile?.defaultPostStreams ? domainProfile?.defaultPostStreams : []
                    }
                }

                const pref = {
                    ...defaultPreference,
                    lists: list
                }

                const storage = JSON.stringify(pref)
                client.api.writeKV('world.concurrent.preference', storage)

                window.location.href = '/'
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

                const pref = {
                    ...defaultPreference,
                    lists: list
                }

                const storage = JSON.stringify(pref)
                client.api.writeKV('world.concurrent.preference', storage)

                window.location.href = '/'
            })
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
                    setProfile={setProfile}
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
                                width: '100%'
                            }}
                        ></Box>
                    </Paper>
                </>
            </ApiProvider>
        </GuestBase>
    )
}
