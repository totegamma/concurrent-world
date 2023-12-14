import { Box, Button, useTheme } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../theming/Passport'
import { type ConcurrentTheme } from '../../model'
import { type Identity } from '../../util'
import { type CoreDomain, type ProfileSchema } from '@concurrent-world/client'
import { useTranslation } from 'react-i18next'

export function RegistrationReady(props: {
    next: () => void
    identity: Identity
    profile: ProfileSchema | null
    host: CoreDomain | null | undefined
}): JSX.Element {
    const theme = useTheme<ConcurrentTheme>()

    const { t } = useTranslation('', { keyPrefix: 'registration.ready' })

    return (
        <>
            <Box
                sx={{
                    padding: '30px',
                    maxWidth: '600px',
                    margin: 'auto'
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <PassportRenderer
                        theme={theme}
                        ccid={props.identity.CCID}
                        name={props.profile?.username ?? ''}
                        avatar={props.profile?.avatar ?? ''}
                        host={props.host?.fqdn ?? ''}
                        cdate={new Date().toLocaleDateString()}
                        trust={0}
                    />
                </Tilt>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Button onClick={props.next}>{t('next')}</Button>
            </Box>
        </>
    )
}
