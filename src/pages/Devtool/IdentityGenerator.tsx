import { Box, Button, Typography } from '@mui/material'
import { forwardRef, useState } from 'react'

import { Mnemonic, randomBytes, HDNodeWallet } from 'ethers'
import { LangJa } from '../../utils/lang-ja'

export const IdentityGenerator = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const [mnemonic, setMnemonic] = useState<string>('')
    const [CCID, setCCID] = useState<string>('')
    const [privateKey, setPrivateKey] = useState<string>('')
    const [publicKey, setPublicKey] = useState<string>('')

    const generateIdentity = (): void => {
        const entrophy = randomBytes(16)
        const mnemonic = Mnemonic.fromEntropy(entrophy, null, LangJa.wordlist())
        const wallet = HDNodeWallet.fromPhrase(mnemonic.phrase, undefined, undefined, LangJa.wordlist())
        const CCID = 'CC' + wallet.address.slice(2)
        const privateKey = wallet.privateKey.slice(2)
        const publicKey = wallet.publicKey.slice(2)

        setMnemonic(mnemonic.phrase)
        setCCID(CCID)
        setPrivateKey(privateKey)
        setPublicKey(publicKey)
    }

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                <Typography variant="h3">IdentityGenerator</Typography>
                <Button variant="contained" onClick={generateIdentity}>
                    Generate
                </Button>
                <Typography variant="h3">mnemonic</Typography>
                <Box>
                    <Typography>{mnemonic}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigator.clipboard.writeText(mnemonic)
                        }}
                    >
                        copy
                    </Button>
                </Box>

                <Typography variant="h3">CCID</Typography>
                <Box>
                    <Typography>{CCID}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigator.clipboard.writeText(CCID)
                        }}
                    >
                        copy
                    </Button>
                </Box>

                <Typography variant="h3">publickey</Typography>
                <Box>
                    <Typography>{publicKey}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigator.clipboard.writeText(publicKey)
                        }}
                    >
                        copy
                    </Button>
                </Box>

                <Typography variant="h3">privatekey</Typography>
                <Box>
                    <Typography>{privateKey}</Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            navigator.clipboard.writeText(privateKey)
                        }}
                    >
                        copy
                    </Button>
                </Box>
            </Box>
        </div>
    )
})

IdentityGenerator.displayName = 'IdentityGenerator'
