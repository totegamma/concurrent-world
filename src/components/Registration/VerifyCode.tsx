import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { type Identity } from '../../util'
import { useTranslation } from 'react-i18next'

export function VerifyCode(props: { next: () => void; identity: Identity }): JSX.Element {
    const [mnemonicTest, setMnemonicTest] = useState<string>('')

    const match = props.identity.mnemonic_ja === mnemonicTest || props.identity.mnemonic_en === mnemonicTest

    const { t } = useTranslation('', { keyPrefix: 'registration.verifyCode' })

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}
        >
            <TextField
                placeholder="12個の単語からなる呪文"
                value={mnemonicTest}
                onChange={(e) => {
                    setMnemonicTest(e.target.value)
                }}
                sx={{
                    width: '100%'
                }}
            />
            <Typography>{match ? t('match') : t('notMatch')}</Typography>
            <Button
                disabled={!match}
                onClick={(): void => {
                    props.next()
                }}
            >
                {t('next')}
            </Button>
        </Box>
    )
}
