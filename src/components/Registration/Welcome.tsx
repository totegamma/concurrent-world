import { Alert, AlertTitle, Box, Button, useTheme } from '@mui/material'
import Tilt from 'react-parallax-tilt'
import { PassportRenderer } from '../theming/Passport'
import { type ConcurrentTheme } from '../../model'
import { type Identity } from '../../util'
import { useTranslation } from 'react-i18next'

export function RegistrationWelcome(props: { next: () => void; identity: Identity }): JSX.Element {
    const theme = useTheme<ConcurrentTheme>()
    const { t } = useTranslation('', { keyPrefix: 'registration.welcome' })
    return (
        <>
            <Alert severity="info">
                <AlertTitle>{t('noticeTitle')}</AlertTitle>
                {t('notice')}
            </Alert>

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
                        name={''}
                        avatar={''}
                        host={''}
                        cdate={''}
                        trust={0}
                    />
                </Tilt>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Button
                    onClick={(): void => {
                        props.next()
                    }}
                >
                    {t('next')}
                </Button>
            </Box>
        </>
    )
}
