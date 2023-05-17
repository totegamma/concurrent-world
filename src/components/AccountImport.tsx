import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { LoadKey } from '../util'
import { useNavigate } from 'react-router-dom'
import { HDNodeWallet } from 'ethers'
import { LangJa } from '../utils/lang-ja'

export function AccountImport(): JSX.Element {
    const navigate = useNavigate()
    const [mnemonic, setMnemonic] = useState<string>('')
    const [secret, setSecret] = useState<string>('')
    const [server, setServer] = useState<string>('')

    const accountImport = (): void => {
        // TODO: add validation
        if (mnemonic === '') {
            const key = LoadKey(secret)
            localStorage.setItem('ServerAddress', JSON.stringify(server))
            localStorage.setItem('PublicKey', JSON.stringify(key.publickey))
            localStorage.setItem('PrivateKey', JSON.stringify(key.privatekey))
            localStorage.setItem('Address', JSON.stringify(key.ccaddress))
            navigate('/')
        } else {
            const wallet = HDNodeWallet.fromPhrase(
                mnemonic,
                undefined,
                undefined,
                LangJa.wordlist()
            ) // TODO: move to utils
            localStorage.setItem('ServerAddress', JSON.stringify(server))
            localStorage.setItem(
                'PublicKey',
                JSON.stringify(wallet.publicKey.slice(2))
            )
            localStorage.setItem(
                'PrivateKey',
                JSON.stringify(wallet.privateKey.slice(2))
            )
            localStorage.setItem(
                'Address',
                JSON.stringify('CC' + wallet.address.slice(2))
            )
        }
        navigate('/')
    }

    return (
        <Paper
            sx={{
                width: { xs: '90vw', md: '60vw' },
                height: { xs: '90vh', md: '600px' },
                p: '10px',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                gap: '10px'
            }}
        >
            <Typography variant="h2">アカウントのインポート</Typography>
            <Typography variant="h3">ふっかつの呪文から</Typography>
            <TextField
                placeholder="12個の単語からなる呪文"
                value={mnemonic}
                onChange={(e) => {
                    setMnemonic(e.target.value)
                }}
            />
            <Box>
                <Divider>または</Divider>
            </Box>
            <Typography variant="h3">秘密鍵を直接入力</Typography>
            <TextField
                placeholder="0x..."
                value={secret}
                onChange={(e) => {
                    setSecret(e.target.value)
                }}
            />
            <Divider sx={{ my: '30px' }} />
            <Typography variant="h3">ホストサーバーアドレス</Typography>
            <TextField
                placeholder="https://example.tld/"
                value={server}
                onChange={(e) => {
                    setServer(e.target.value)
                }}
            />
            <Button variant="contained" onClick={accountImport}>
                インポート
            </Button>
        </Paper>
    )
}
