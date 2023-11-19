import { Box, Button, ButtonGroup, Typography } from '@mui/material'
import { type Identity } from '../../util'
import { SecretCode } from '../ui/SecretCode'

export function SaveSecretCode(props: {
    next: () => void
    identity: Identity
    mnemonicLanguage: string
    setMnemonicLanguage: (value: 'ja' | 'en') => void
}): JSX.Element {
    const mnemonic = props.mnemonicLanguage === 'ja' ? props.identity.mnemonic_ja : props.identity.mnemonic_en

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
                        ja
                    </Button>
                    <Button
                        variant={props.mnemonicLanguage === 'en' ? 'contained' : 'outlined'}
                        onClick={() => {
                            props.setMnemonicLanguage('en')
                        }}
                    >
                        en
                    </Button>
                </ButtonGroup>
            </Box>
            <SecretCode mnemonic={mnemonic} />
            <Typography>
                シークレットコードは、あなたが再ログインしたいとき、別の端末からログインしたいときに必要な呪文です。
            </Typography>
            <Typography>
                <b>絶対に紛失しないように</b>そして、
                <b>絶対に誰にも知られないように</b>してください。
            </Typography>
            <Typography>
                紛失すると、二度とあなたのアカウントにアクセスできなくなります。
                また、他人に知られると、あなたのアカウントがハッカーとの共有アカウントになってしまいます。
            </Typography>
            <Typography>メモを取りましたか？</Typography>
            <Button
                variant="contained"
                onClick={(): void => {
                    props.next()
                }}
            >
                Next: シークレットコードの確認
            </Button>
        </Box>
    )
}
