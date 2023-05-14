import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { useMemo, useState } from 'react'
import { Mnemonic, randomBytes, HDNodeWallet } from 'ethers'
import { LangJa } from '../utils/lang-ja'
import { useNavigate } from 'react-router-dom'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import { ProfileEditor } from './ProfileEditor'

export function Registration(): JSX.Element {
    const navigate = useNavigate()
    const [activeStep, setActiveStep] = useState(0)
    const [mnemonicTest, setMnemonicTest] = useState<string>('')

    const entrophy = useMemo(() => randomBytes(16), [])
    const mnemonic = useMemo(
        () => Mnemonic.fromEntropy(entrophy, null, LangJa.wordlist()),
        []
    )
    const wallet = useMemo(
        () =>
            HDNodeWallet.fromPhrase(
                mnemonic.phrase,
                undefined,
                undefined,
                LangJa.wordlist()
            ),
        []
    )
    const userAddress = 'CC' + wallet.address.slice(2)
    const privateKey = wallet.privateKey.slice(2)
    const [server, setServer] = useState<string>('')

    const setupAccount = (): void => {
        localStorage.setItem('ServerAddress', JSON.stringify(server))
        localStorage.setItem(
            'PublicKey',
            JSON.stringify(wallet.publicKey.slice(2))
        )
        localStorage.setItem('PrivateKey', JSON.stringify(privateKey))
        localStorage.setItem('Address', JSON.stringify(userAddress))
        navigate('/')
    }

    const step0 = (
        <>
            <Typography variant="h2">
                Concurrentアカウントを作成しましょう！
            </Typography>
            まずは、背後にだれもいないことを確認してください。
            次の画面で、重要な秘密のフレーズを出力します。
        </>
    )
    const step1 = (
        <Box sx={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <Typography variant="h2">あなたの「ふっかつのじゅもん」</Typography>
            <Typography>
                <b>{mnemonic.phrase}</b>
            </Typography>
            <Typography>
                ふっかつのじゅもんは、あなたが再ログインしたいとき、別の端末からログインしたいときに必要な呪文です。
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
        </Box>
    )
    const step2 = (
        <>
            <Typography variant="h2">「ふっかつのじゅもん」の入力</Typography>
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
            {mnemonic.phrase === mnemonicTest
                ? '一致しています'
                : '一致していません'}
        </>
    )
    const step3 = (
        <>
            <Typography variant="h2">ホストサーバーの選択</Typography>
            あなたのメッセージを保存・配信してくれるホストサーバーを探しましょう。
            どのホストサーバーを選択しても、だれとでもつながる事ができます。
            <Typography variant="h3">リストから選択</Typography>
            公開ホスト検索は未実装です
            <Divider>または</Divider>
            <Typography variant="h3">URLから直接入力</Typography>
            <TextField
                placeholder="https://example.tld/"
                value={server}
                onChange={(e) => {
                    setServer(e.target.value)
                }}
                sx={{
                    width: '100%'
                }}
            />
        </>
    )
    const step4 = (
        <>
            <Typography variant="h2">プロフィールの作成</Typography>
            ここで名前・アイコン・自己紹介を設定します。
            <ProfileEditor
                initial={{
                    ccaddress: '',
                    username: '',
                    avatar: '',
                    homestream: '',
                    notificationstream: '',
                    description: ''
                }}
                userAddress={userAddress}
                privatekey={privateKey}
                serverAddress={server}
            />
        </>
    )

    const steps = [
        {
            title: 'はじめよう！',
            component: step0
        },
        {
            title: '秘密鍵とアドレスの生成',
            component: step1
        },
        {
            title: '復活の呪文の確認',
            component: step2
        },
        {
            title: 'ホストサーバーの選択',
            component: step3
        },
        {
            title: 'プロフィールの作成',
            component: step4
        }
    ]

    const handleNext = (): void => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = (): void => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    return (
        <Paper
            sx={{
                width: '60vw',
                height: '600px',
                p: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            <Typography>Concurrentアカウントセットアップウィザード</Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((step, index) => {
                    const stepProps: { completed?: boolean } = {}
                    const labelProps: {
                        optional?: React.ReactNode
                    } = {}
                    return (
                        <Step key={step.title} {...stepProps}>
                            <StepLabel {...labelProps}>{step.title}</StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <>
                    <Typography sx={{ mt: 2, mb: 1 }}>
                        これで完了です！始めましょう！
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            pt: 2
                        }}
                    >
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button variant="contained" onClick={setupAccount}>
                            GO!
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{ flex: 1 }}>{steps[activeStep].component}</Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            pt: 2
                        }}
                    >
                        <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button variant="contained" onClick={handleNext}>
                            {activeStep === steps.length - 1
                                ? 'Finish'
                                : 'Next'}
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    )
}
