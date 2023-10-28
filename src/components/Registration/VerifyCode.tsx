import { Box, Button, TextField } from '@mui/material'
import { useState } from 'react'
import { type Identity } from '../../util'

export function VerifyCode(props: { next: () => void; identity: Identity }): JSX.Element {
    const [mnemonicTest, setMnemonicTest] = useState<string>('')

    const match = props.identity.mnemonic_ja === mnemonicTest || props.identity.mnemonic_en === mnemonicTest

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
            {match ? '一致しています' : '一致していません'}
            <Button
                variant="contained"
                disabled={!match}
                onClick={(): void => {
                    props.next()
                }}
            >
                Next: ドメインの選択
            </Button>
        </Box>
    )
}
