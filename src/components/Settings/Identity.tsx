import { Alert, Box, Button, Grid, Step, StepContent, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import { Passport } from '../../components/theming/Passport'
import Tilt from 'react-parallax-tilt'
import { useApi } from '../../context/api'
import { useTranslation } from 'react-i18next'
import { useMemo, useRef, useState } from 'react'
import EmailIcon from '@mui/icons-material/Email'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { HDNodeWallet, LangEn } from 'ethers'
import { LangJa } from '../../utils/lang-ja'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

import ccPaper from '../../resources/cc-paper.svg'

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

    const ref = useRef<HTMLDivElement>(null)

    const steps = [
        {
            label: 'マスターキーを安全に保存',
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>
                        アカウントの引っ越しや、復旧にこのキーが必要になります。また、他人に知られた場合アカウントに不正にアクセスされることになるので、絶対に秘密です。
                    </Typography>
                    <Alert severity="error">
                        このステップがマスターキーをダウンロードできる最後の機会です！ここで保管を怠ると、このアカウントは絶対に復旧できません。
                        印刷して金庫に保管するなど、安全で確実な方法で保管することをお勧めします。
                    </Alert>
                    <Box display="flex" gap={1}>
                        <Button
                            component="a"
                            target="_blank"
                            href={`mailto:?subject=concurrent secret&body=
** このメールの宛先を自分自身に設定し、送信してください。**%0D%0A
%0D%0A
=== 識別情報 ===%0D%0A
識別子: ${client?.ccid}%0D%0A
マスターキー: ${mnemonic}%0D%0A
================%0D%0A
%0D%0A
%0D%0A
マスターキーは、あなたがこの識別子で識別されるアカウントの所有者であることを証明する唯一の合言葉です。%0D%0A
このキーが悪意のある第三者に知られた場合、このアカウントの安全性は失われるため自身の手でアカウントを凍結する手続きを行う必要が生じます。%0D%0A
%0D%0A
マスターキーは、アカウントの引っ越しや、サブキーを失った際の復旧など、重要な操作を行う際に使用することになります。%0D%0A
それまで、印刷して金庫に保管するなどして、安全で確実な方法で保管してください。%0D%0A`}
                            startIcon={<EmailIcon />}
                        >
                            自分宛にメールで送信
                        </Button>
                        <Button
                            onClick={() => {
                                html2canvas(ref.current as HTMLElement).then((canvas) => {
                                    const url = canvas.toDataURL('image/png', 2.0)
                                    const pdf = new JsPDF('p', 'mm', 'a4')
                                    pdf.addImage(url, 'svg', 0, 0, 210, 297)
                                    pdf.save('concurrent_master_key.pdf')
                                })
                            }}
                            startIcon={<FileDownloadIcon />}
                        >
                            PDFでダウンロード
                        </Button>
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
                    <Typography>準備はできましたか？正しくマスターキーを保管できたか確認します。</Typography>
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
                        マスターキーは秘密度の高い情報なので、マスターキーから「身代わり」となるサブキーを生成し、
                        この端末ではマスターキーとの入れ替えを行います。
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

            <Box
                sx={{
                    width: '0px',
                    height: '0px',
                    overflow: 'hidden'
                }}
            >
                <div
                    ref={ref}
                    style={{
                        width: '210mm',
                        height: '297mm',
                        border: '1px solid black',
                        backgroundImage: `url(${ccPaper})`,
                        position: 'relative',
                        color: 'black',
                        fontFamily: 'serif'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '50%',
                            fontSize: '48px',
                            color: 'black',
                            textAlign: 'center',
                            transform: 'translate(-50%, 0%)'
                        }}
                    >
                        識別情報
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            top: '5mm',
                            right: '5mm',
                            fontSize: '7mm',
                            color: 'black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            border: '3px solid black',
                            padding: '5px',
                            borderRadius: '5px'
                        }}
                    >
                        極秘
                    </div>

                    <Box
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '50%',
                            fontSize: '20px',
                            color: 'black',
                            textAlign: 'center',
                            transform: 'translate(-50%, 0%)',
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                borderSpacing: '0',
                                border: '1px solid black'
                            }}
                        >
                            <tr>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'center'
                                    }}
                                >
                                    識別子
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {client?.ccid ?? '不明'}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'center',
                                        wordBreak: 'keep-all'
                                    }}
                                >
                                    マスターキー
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    <Box
                                        component={Grid}
                                        style={{
                                            overflow: 'hidden'
                                        }}
                                        spacing={1}
                                        columns={3}
                                        container
                                    >
                                        {mnemonic.split(' ').map((e: string, i: number) => (
                                            <Grid
                                                key={i}
                                                item
                                                xs={2}
                                                sm={1}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    padding: '3px'
                                                }}
                                            >
                                                {i + 1}:
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        padding: '3px',
                                                        width: '100%',
                                                        textAlign: 'center',
                                                        border: '1px solid black',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    {e}
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Box>
                                </td>
                            </tr>
                        </table>
                    </Box>

                    <div
                        style={{
                            position: 'absolute',
                            top: '85%',
                            left: '50%',
                            fontSize: '13px',
                            transform: 'translate(-50%, -50%)',
                            width: '90%'
                        }}
                    >
                        マスターキーは、あなたがこの識別子で識別されるアカウントの所有者であることを証明する唯一の合言葉です。
                        <br />
                        このキーが悪意のある第三者に知られた場合、このアカウントの安全性は失われるため自身の手でアカウントを凍結する手続きを行う必要が生じます。
                        <br />
                        マスターキーは、アカウントの引っ越しや、サブキーを失った際の復旧など、重要な操作を行う際に使用することになります。
                        それまで、印刷して金庫に保管するなどして、安全で確実な方法で保管してください。
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '5%',
                            fontSize: '15px',
                            fontFamily: 'serif',
                            color: 'black',
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                fontFamily: 'serif'
                            }}
                        >
                            参考情報
                        </div>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                borderSpacing: '0',
                                border: '1px solid black'
                            }}
                        >
                            <tr>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'center'
                                    }}
                                >
                                    名称
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {client?.user?.profile?.payload.body.username ?? '未設定'}
                                </td>
                            </tr>
                            <tr>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'center'
                                    }}
                                >
                                    管轄ドメイン
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {client?.host}
                                </td>
                            </tr>
                        </table>
                        <div>参考情報はこの証書を発行した当時の情報であり、現在は変更されている可能性があります。</div>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            bottom: '4%',
                            right: '5%',
                            fontSize: '15px',
                            fontFamily: 'serif',
                            color: 'black',
                            textAlign: 'center'
                        }}
                    >
                        発行日: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </Box>

            {/*
            <Typography variant="h3">{t('secret')}</Typography>
            {mnemonic ? <SecretCode mnemonic={mnemonic} /> : <Typography>{t('secretCannotBeRestored')}</Typography>}
            <a href="mailto:?subject='concurrent secret'&body=Here is my secret: ${mnemonic}">Send to my email</a>
            */}
        </Box>
    )
}
