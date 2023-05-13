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

export function Registration(): JSX.Element {
    const [activeStep, setActiveStep] = useState(0)
    const [skipped, setSkipped] = useState(new Set<number>())

    const entrophy = useMemo(() => randomBytes(16), [])
    const mnemonic = useMemo(
        () => Mnemonic.fromEntropy(entrophy, null, LangJa.wordlist()),
        []
    )
    const wallet = useMemo(() => HDNodeWallet.fromMnemonic(mnemonic), [])

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
            ちゃんとメモが正しく取れているかを確認します。
        </>
    )
    const step3 = (
        <>
            <Typography variant="h2">ホストサーバーの選択</Typography>
            あなたのメッセージを保存・配信してくれるホストサーバーを探しましょう。
            どのホストサーバーを選択しても、だれとでもつながる事ができます。
        </>
    )
    const step4 = (
        <>
            <Typography variant="h2">プロフィールの作成</Typography>
            ここで名前・アイコン・自己紹介を設定します。後ででも大丈夫です。
        </>
    )

    const steps = [
        {
            title: 'はじめよう！',
            component: step0,
            optional: false
        },
        {
            title: '秘密鍵とアドレスの生成',
            component: step1,
            optional: false
        },
        {
            title: '復活の呪文の確認',
            component: step2,
            optional: false
        },
        {
            title: 'ホストサーバーの選択',
            component: step3,
            optional: false
        },
        {
            title: 'プロフィールの作成',
            component: step4,
            optional: true
        }
    ]

    const isStepSkipped = (step: number): boolean => {
        return skipped.has(step)
    }

    const handleNext = (): void => {
        let newSkipped = skipped
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values())
            newSkipped.delete(activeStep)
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1)
        setSkipped(newSkipped)
    }

    const handleBack = (): void => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleSkip = (): void => {
        if (!steps[activeStep].optional) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.")
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1)
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values())
            newSkipped.add(activeStep)
            return newSkipped
        })
    }

    const handleReset = (): void => {
        setActiveStep(0)
    }

    return (
        <Paper
            sx={{
                width: '60vw',
                height: '600px',
                p: '20px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Typography>Concurrentアカウントセットアップウィザード</Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((step, index) => {
                    const stepProps: { completed?: boolean } = {}
                    const labelProps: {
                        optional?: React.ReactNode
                    } = {}
                    if (step.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">Optional</Typography>
                        )
                    }
                    if (isStepSkipped(index)) {
                        stepProps.completed = false
                    }
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
                        <Button onClick={handleReset}>Reset</Button>
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
                        {steps[activeStep].optional && (
                            <Button
                                color="inherit"
                                onClick={handleSkip}
                                sx={{ mr: 1 }}
                            >
                                Skip
                            </Button>
                        )}
                        <Button onClick={handleNext}>
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
