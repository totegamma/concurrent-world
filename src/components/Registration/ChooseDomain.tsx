import { type Identity, type Client, type CoreDomain } from '@concurrent-world/client'
import { Alert, AlertTitle, Box, Button, Divider, Link, List, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { jumpToDomainRegistration } from '../../util'
import { useTranslation } from 'react-i18next'
import { ListItemDomain } from '../ui/ListItemDomain'

interface ChooseDomainProps {
    next: () => void
    identity: Identity
    client: Client | undefined
    host: CoreDomain | null | undefined
    setHost: (_: CoreDomain | null | undefined) => void
}

// Send PR your domain to add here!
const domainlist = ['ariake.concrnt.net', 'denken.concrnt.net', 'zyouya.concrnt.net']

export function ChooseDomain(props: ChooseDomainProps): JSX.Element {
    const { t } = useTranslation('', { keyPrefix: 'registration.chooseDomain' })
    const [server, setServer] = useState<string>('')
    const [jumped, setJumped] = useState<boolean>(false)

    useEffect(() => {
        let unmounted = false
        if (!props.client) return
        const fqdn = server.replace('https://', '').replace('/', '')
        props.client.api.getDomain(fqdn).then((e) => {
            if (unmounted) return
            props.setHost(e)
        })
        return () => {
            unmounted = true
        }
    }, [server])

    let next = window.location.href
    // strip hash
    const hashIndex = next.indexOf('#')
    if (hashIndex !== -1) {
        next = next.substring(0, hashIndex)
    }
    // add next hash
    next = `${next}#2`

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}
        >
            <Typography>
                {t('desc1')}
                <br />
                {t('desc2')}
                <br />
                {t('desc3')}
            </Typography>
            <Alert severity="info">
                <AlertTitle>{t('notice')}</AlertTitle>
            </Alert>
            <Box width="100%" display="flex" flexDirection="column">
                <Typography variant="h3">{t('chooseFromList')}</Typography>
                <List>
                    {domainlist.map((domain) => (
                        <ListItemDomain
                            key={domain}
                            domainFQDN={domain}
                            onClick={() => {
                                setJumped(true)
                                setServer(domain)
                                jumpToDomainRegistration(props.identity.CCID, props.identity.privateKey, domain, next)
                            }}
                        />
                    ))}
                </List>
                <Divider>{t('or')}</Divider>
                <Typography variant="h3">{t('directInput')}</Typography>
                <Typography
                    color="text.primary"
                    component={Link}
                    variant="caption"
                    href="https://github.com/totegamma/concurrent"
                    target="_blank"
                >
                    {t('tips')}
                </Typography>
                <Box flex="1" />
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <TextField
                        placeholder="concurrent.example.tld"
                        value={server}
                        onChange={(e) => {
                            setServer(e.target.value)
                        }}
                        sx={{
                            flex: 1
                        }}
                    />
                    <Button
                        disabled={!props.host}
                        onClick={() => {
                            setJumped(true)
                            jumpToDomainRegistration(props.identity.CCID, props.identity.privateKey, server, next)
                        }}
                    >
                        {t('jump')}
                    </Button>
                </Box>
            </Box>
            <Button
                disabled={!jumped}
                onClick={(): void => {
                    props.client?.api.invalidateEntity(props.identity.CCID)
                    props.client?.api
                        .getEntity(props.identity.CCID)
                        .then((e) => {
                            if (e?.ccid != null) {
                                props.next()
                            } else {
                                alert(t('notRegistered'))
                            }
                        })
                        .catch(() => {
                            alert(t('notRegistered'))
                        })
                }}
            >
                {jumped ? t('next') : t('nextDisabled')}
            </Button>
        </Box>
    )
}
