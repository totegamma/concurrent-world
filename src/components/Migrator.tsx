import { type CoreDomain } from '@concurrent-world/client'
import { useEffect, useState } from 'react'
import { useClient } from '../context/ClientContext'
import { Box, Typography, Avatar, TextField, Stepper, Step, StepLabel, StepContent, Button } from '@mui/material'
import { LogoutButton } from './Settings/LogoutButton'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { jumpToDomainRegistration } from '../util'
import { useSnackbar } from 'notistack'
import { RepositoryExportButton, RepositoryImportButton } from './RepositoryManageButtons'

export function Migrator(): JSX.Element {
    const { client } = useClient()
    const [currentDomain, setCurrentDomain] = useState<CoreDomain | null>(null)
    const [destFqdn, setDestFqdn] = useState<string>('')
    const [destinationDomain, setDestinationDomain] = useState<CoreDomain | null>(null)
    const [activeStep, setActiveStep] = useState(0)
    const [registrationOK, setRegistrationOK] = useState(false)
    const [imported, setImported] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        if (!client) return
        client.api.getDomain(client.host).then((e) => {
            setCurrentDomain(e ?? null)
        })
    }, [client])

    useEffect(() => {
        if (!client) return
        if (!destFqdn) return
        setDestinationDomain(null)
        let unmounted = false
        const timer = setTimeout(() => {
            client.api.getDomain(destFqdn).then((e) => {
                if (unmounted) return
                setDestinationDomain(e ?? null)
            })
        }, 300)
        return () => {
            unmounted = true
            clearTimeout(timer)
        }
    }, [client, destFqdn])

    const steps = [
        {
            label: '引っ越し先の入力',
            content: (
                <TextField
                    label="移行先ドメイン"
                    fullWidth
                    value={destFqdn}
                    onChange={(e) => {
                        setDestFqdn(e.target.value)
                    }}
                />
            ),
            ok: () =>
                currentDomain !== null && destinationDomain !== null && currentDomain.fqdn !== destinationDomain.fqdn
        },
        {
            label: '引っ越し先に登録',
            content: (
                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography>まずは引っ越し先ドメインにて登録を行います。</Typography>
                    <Button
                        fullWidth
                        color="primary"
                        onClick={() => {
                            jumpToDomainRegistration(client.ccid!, client.keyPair!.privatekey, destFqdn)
                        }}
                    >
                        引っ越し先登録ページに移動
                    </Button>
                    <Typography>登録完了後、確認ボタンを押してください。</Typography>
                    <Button
                        fullWidth
                        color="primary"
                        onClick={() => {
                            fetch(`https://${destFqdn}/api/v1/entity/${client.ccid!}`)
                                .then((e) => e.json())
                                .then((e) => {
                                    if (e.content.domain === destFqdn) {
                                        setRegistrationOK(true)
                                    } else {
                                        setRegistrationOK(false)
                                        enqueueSnackbar(
                                            `登録が完了していないようです。検出された所属: ${e.content.domain}`,
                                            {
                                                variant: 'error'
                                            }
                                        )
                                    }
                                })
                        }}
                    >
                        登録状況を確認
                    </Button>
                </Box>
            ),
            ok: () => registrationOK
        },
        {
            label: '現住所からレポジトリデータをダウンロード',
            content: <RepositoryExportButton />,
            ok: () => true
        },
        {
            label: '移行先にレポジトリデータをアップロード',
            content: (
                <>
                    <Typography>実際にすべてのデータが読み込まれるまで時間がかかる場合があります。</Typography>
                    <RepositoryImportButton
                        domain={destFqdn}
                        onImport={(err: string) => {
                            setImported(err === '')
                        }}
                    />
                </>
            ),
            ok: () => imported
        },
        {
            label: '現住所にデータ削除依頼を送信',
            content: (
                <>
                    <Typography>
                        猶予を7日で作成するので、問題が発生した場合は削除リクエストをキャンセルすることができます。
                    </Typography>
                    <Button>削除リクエストを送信</Button>
                </>
            ),
            ok: () => true
        },
        {
            label: '引っ越し完了!',
            content: <Button>リロードして完了させる</Button>
        }
    ]

    if (client.api.ckid)
        return (
            <>
                <Typography>引っ越しは重要なアカウント操作のため、マスターキーでのログインが必要です。</Typography>
                <LogoutButton />
            </>
        )

    return (
        <>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-around">
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography variant="h3">{currentDomain?.meta.nickname}</Typography>
                    <Avatar
                        src={currentDomain?.meta.logo}
                        sx={{
                            width: 100,
                            height: 100
                        }}
                    />
                </Box>
                <ArrowForwardIcon
                    sx={{
                        fontSize: 100
                    }}
                />
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography variant="h3">{destinationDomain?.meta.nickname ?? '???'}</Typography>
                    <Avatar
                        src={destinationDomain?.meta.logo}
                        sx={{
                            width: 100,
                            height: 100
                        }}
                    >
                        ?
                    </Avatar>
                </Box>
            </Box>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, _) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                        <StepContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                <Box>{step.content}</Box>
                                <Box display="flex" flexDirection="row" justifyContent="space-between">
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={() => {
                                            setActiveStep((prev) => prev - 1)
                                        }}
                                    >
                                        戻る
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            setActiveStep((prev) => prev + 1)
                                        }}
                                        disabled={!step.ok?.()}
                                    >
                                        {activeStep === steps.length - 1 ? '完了' : '次へ'}
                                    </Button>
                                </Box>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </>
    )
}
