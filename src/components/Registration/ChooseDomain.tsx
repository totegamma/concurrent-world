import { type Client, type CoreDomain } from '@concurrent-world/client'
import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Divider,
    Link,
    List,
    ListItemAvatar,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { jumpToDomainRegistration, type Identity } from '../../util'
import { useTranslation } from 'react-i18next'

interface ChooseDomainProps {
    next: () => void
    identity: Identity
    client: Client | undefined
    host: CoreDomain | null | undefined
    setHost: (_: CoreDomain | null | undefined) => void
}

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
        console.log(fqdn)
        return () => {
            unmounted = true
        }
    }, [server])

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
                    <ListItemButton
                        onClick={() => {
                            setJumped(true)
                            setServer('hub.concurrent.world')
                            jumpToDomainRegistration(
                                props.identity.CCID,
                                props.identity.privateKey,
                                'hub.concurrent.world'
                            )
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar></Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="hub.concurrent.world" />
                        <ListItemIcon>
                            <OpenInNewIcon />
                        </ListItemIcon>
                    </ListItemButton>
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
                            jumpToDomainRegistration(props.identity.CCID, props.identity.privateKey, server)
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
