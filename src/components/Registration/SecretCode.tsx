import { Box, Button, ButtonGroup, Typography } from '@mui/material'
import { type Identity } from '../../util'
import { SecretCode } from '../ui/SecretCode'
import { useTranslation } from 'react-i18next'

export function SaveSecretCode(props: {
    next: () => void
    identity: Identity
    mnemonicLanguage: string
    setMnemonicLanguage: (value: 'ja' | 'en') => void
}): JSX.Element {
    const mnemonic = props.mnemonicLanguage === 'ja' ? props.identity.mnemonic_ja : props.identity.mnemonic_en

    const { t } = useTranslation('', { keyPrefix: 'registration.saveSecret' })

    return (
        <Box
            sx={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Box display="flex" flexDirection="row" justifyContent="flex-end" width="100%">
                <ButtonGroup variant="outlined" aria-label="outlined button group">
                    <Button
                        variant={props.mnemonicLanguage === 'ja' ? 'contained' : 'outlined'}
                        onClick={() => {
                            props.setMnemonicLanguage('ja')
                        }}
                    >
                        あ
                    </Button>
                    <Button
                        variant={props.mnemonicLanguage === 'en' ? 'contained' : 'outlined'}
                        onClick={() => {
                            props.setMnemonicLanguage('en')
                        }}
                    >
                        A
                    </Button>
                </ButtonGroup>
            </Box>
            <SecretCode mnemonic={mnemonic} />
            <Typography>{t('desc1')}</Typography>
            <Typography>{t('desc2')}</Typography>
            <Typography>{t('desc3')}</Typography>
            <Typography>{t('didyousave')}</Typography>
            <Button
                onClick={(): void => {
                    props.next()
                }}
            >
                {t('next')}
            </Button>
        </Box>
    )
}
