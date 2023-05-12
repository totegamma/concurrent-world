import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { useState } from 'react'
import { createConcurrentTheme } from '../themes'
import { ThemeProvider, darken } from '@mui/material'

const steps = [
    '秘密鍵とアドレスの生成',
    'ホストサーバーの選択',
    'プロフィールの作成'
]

export function Welcome(): JSX.Element {
    const [activeStep, setActiveStep] = useState(0)
    const [skipped, setSkipped] = useState(new Set<number>())

    const theme = createConcurrentTheme('redmond')

    const isStepOptional = (step: number): boolean => {
        return step === 2
    }

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
        if (!isStepOptional(activeStep)) {
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
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    width: '100vw',
                    height: '100dvh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: [
                        theme.palette.background.default,
                        `linear-gradient(${
                            theme.palette.background.default
                        }, ${darken(theme.palette.background.default, 0.1)})`
                    ]
                }}
            >
                <Paper sx={{ width: '60vw', height: '600px', p: '20px' }}>
                    <Typography>ようこそ</Typography>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => {
                            const stepProps: { completed?: boolean } = {}
                            const labelProps: {
                                optional?: React.ReactNode
                            } = {}
                            if (isStepOptional(index)) {
                                labelProps.optional = (
                                    <Typography variant="caption">
                                        Optional
                                    </Typography>
                                )
                            }
                            if (isStepSkipped(index)) {
                                stepProps.completed = false
                            }
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>
                                        {label}
                                    </StepLabel>
                                </Step>
                            )
                        })}
                    </Stepper>
                    {activeStep === steps.length ? (
                        <>
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                All steps completed - you&apos;re finished
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
                            <Typography sx={{ mt: 2, mb: 1 }}>
                                Step {activeStep + 1}
                            </Typography>
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
                                {isStepOptional(activeStep) && (
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
            </Box>
        </ThemeProvider>
    )
}
