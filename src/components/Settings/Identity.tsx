import { Alert, Box, Button, Step, StepContent, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import { Passport } from '../../components/theming/Passport'
import Tilt from 'react-parallax-tilt'
import { useApi } from '../../context/api'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import EmailIcon from '@mui/icons-material/Email'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../../utils/lang-ja'

export const IdentitySettings = (): JSX.Element => {
    const client = useApi()
    const { t } = useTranslation('', { keyPrefix: 'settings.profile' })
    const [mnemonicTest, setMnemonicTest] = useState<string>('')

    const [activeStep, setActiveStep] = useState(0)

    const mnemonic = JSON.parse(localStorage.getItem('Mnemonic') || 'null')

    const mnemonicToPrivateKey = (mnemonic: string): string => {
        const normalized = mnemonic.trim().normalize('NFKD')
        const split = normalized.split(' ')
        if (split.length !== 12) {
            throw new Error('Invalid mnemonic')
        }

        if (normalized[0].match(/[a-z]/)) {
            const wallet = HDNodeWallet.fromPhrase(normalized)
            return wallet.privateKey.slice(2)
        } else {
            const ja2en = split
                .map((word) => {
                    const wordIndex = LangJa.wordlist().getWordIndex(word)
                    return LangEn.wordlist().getWord(wordIndex)
                })
                .join(' ')
            const wallet = HDNodeWallet.fromPhrase(ja2en)
            return wallet.privateKey.slice(2)
        }
    }

    const testOK = useMemo(() => {
        try {
            const master = mnemonicToPrivateKey(mnemonic)
            const test = mnemonicToPrivateKey(mnemonicTest)
            return master === test
        } catch (_) {
            return false
        }
    }, [mnemonic, mnemonicTest])

    const steps = [
        {
            label: 'マスターキーを安全に保存',
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>
                        アカウントの引っ越しや、復旧にこのキーが必要になります。また、他人に知られた場合アカウントに不正にアクセスされることになるので、絶対に秘密です。
                    </Typography>
                    <Alert severity="error">
                        このステップがマスターキーをメモできる最後の機会です！ここでメモを怠ると、このアカウントは絶対に復旧できません。
                        印刷して金庫に保管するなど、安全で確実な方法で保管することをお勧めします。
                    </Alert>
                    <Box display="flex" gap={1}>
                        <Button startIcon={<EmailIcon />}>自分宛にメールで送信</Button>
                        <Button startIcon={<FileDownloadIcon />}>PDFでダウンロード</Button>
                        <Box flexGrow={1} />
                        <Button
                            onClick={() => {
                                setActiveStep(1)
                            }}
                        >
                            次へ
                        </Button>
                    </Box>
                </Box>
            )
        },
        {
            label: 'バックアップの確認',
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>お別れの準備はできましたか？正しくマスターキーを保管できたか確認します。</Typography>
                    <TextField
                        fullWidth
                        placeholder="12個の単語からなる呪文を入力"
                        value={mnemonicTest}
                        onChange={(e) => {
                            setMnemonicTest(e.target.value)
                        }}
                        sx={{
                            width: '100%'
                        }}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <Button
                            onClick={() => {
                                setActiveStep(0)
                            }}
                        >
                            戻る
                        </Button>
                        <Button
                            disabled={!testOK}
                            onClick={() => {
                                setActiveStep(2)
                            }}
                        >
                            {testOK ? '次へ' : '一致しません'}
                        </Button>
                    </Box>
                </Box>
            )
        },
        {
            label: '端末からマスターキーを抹消',
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>
                        マスターキーは秘密度の高い情報なので、マスターキーから「身代わり」となるサブキーを生成します。
                        その後、マスターキーを端末から永久に削除します。
                    </Typography>
                    <Button fullWidth color="error">
                        マスターキーを端末から完全に削除してサブキーへ切り替える
                    </Button>
                </Box>
            )
        }
    ]

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            <Box
                sx={{
                    padding: { xs: '10px', sm: '10px 50px' }
                }}
            >
                <Tilt glareEnable={true} glareBorderRadius="5%">
                    <Passport />
                </Tilt>
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, _) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                        <StepContent>
                            <Box>{step.content}</Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>

            {/*
            <Typography variant="h3">{t('secret')}</Typography>
            {mnemonic ? <SecretCode mnemonic={mnemonic} /> : <Typography>{t('secretCannotBeRestored')}</Typography>}
            <a href="mailto:?subject='concurrent secret'&body=Here is my secret: ${mnemonic}">Send to my email</a>
            */}
        </Box>
    )
}
