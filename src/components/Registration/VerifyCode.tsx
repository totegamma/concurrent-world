import { Box, Button, TextField } from "@mui/material"
import { useState } from "react"


export function VerifyCode(props: {next: ()=>void}): JSX.Element {

    const [mnemonicTest, setMnemonicTest] = useState<string>('')

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
            {mnemonic === mnemonicTest ? '一致しています' : '一致していません'}
            <Button
                variant="contained"
                disabled={mnemonic !== mnemonicTest}
                onClick={(): void => {
                    props.next()
                }}
            >
                Next: ドメインの選択
            </Button>
        </Box>
    )
}

