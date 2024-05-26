import {
    Alert,
    Box,
    Button,
    Grid,
    MenuItem,
    Select,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from '@mui/material'
import { useClient } from '../context/ClientContext'
import { useMemo, useRef, useState } from 'react'
import EmailIcon from '@mui/icons-material/Email'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'
import ccPaper from '../resources/cc-paper.svg'
import { ComputeCKID, type Identity, GenerateIdentity, LoadKeyFromMnemonic } from '@concurrent-world/client'
import { Trans, useTranslation } from 'react-i18next'

export interface SwitchMasterToSubProps {
    identity: Identity
}

export default function SwitchMasterToSub(props: SwitchMasterToSubProps): JSX.Element {
    const { client } = useClient()
    const [mnemonicTest, setMnemonicTest] = useState<string>('')
    const [activeStep, setActiveStep] = useState(0)
    const [processing, setProcessing] = useState(false)

    const { t, i18n } = useTranslation('', { keyPrefix: 'settings.identity.switchMasterToSub' })
    const [keyFormat, setKeyFormat] = useState<'ja' | 'en'>(i18n.language === 'ja' ? 'ja' : 'en')

    const testOK = useMemo(() => {
        try {
            const master = props.identity.privateKey
            const test = LoadKeyFromMnemonic(mnemonicTest)?.privatekey
            return master === test
        } catch (_) {
            return false
        }
    }, [props.identity, mnemonicTest])

    const mnemonic = useMemo(() => {
        if (keyFormat === 'ja') {
            return props.identity.mnemonic_ja
        } else {
            return props.identity.mnemonic
        }
    }, [props.identity, keyFormat])

    const ref = useRef<HTMLDivElement>(null)

    const steps = [
        {
            label: t('saveMasterKey'),
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>{t('descSaveMasterKey')}</Typography>
                    <Alert severity="error">
                        <Trans i18nKey={'settings.identity.switchMasterToSub.alertMasterKey'} />
                    </Alert>
                    <Box display="flex" alignItems="center" flexDirection="row" gap={1}>
                        <Typography>{t('masterKeyFormat')}</Typography>
                        <Select
                            value={keyFormat}
                            onChange={(e) => {
                                setKeyFormat(e.target.value as 'ja' | 'en')
                            }}
                        >
                            <MenuItem value="ja">日本語</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                        </Select>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            component="a"
                            target="_blank"
                            href={t('mailHerf', { ccid: client?.ccid, mnemonic })}
                            startIcon={<EmailIcon />}
                        >
                            {t('sendEmail')}
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
                            {t('downloadPDF')}
                        </Button>
                        <Box flexGrow={1} />
                        <Button
                            onClick={() => {
                                setActiveStep(1)
                            }}
                        >
                            {t('next')}
                        </Button>
                    </Box>
                </Box>
            )
        },
        {
            label: t('verifyBackup'),
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>{t('descVerifyBackup')}</Typography>
                    <TextField
                        fullWidth
                        placeholder={t('masterKeyPlaceholder')}
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
                            {t('back')}
                        </Button>
                        <Button
                            disabled={!testOK}
                            onClick={() => {
                                setActiveStep(2)
                            }}
                        >
                            {testOK ? t('next') : t('testNG')}
                        </Button>
                    </Box>
                </Box>
            )
        },
        {
            label: t('removeMasterKey'),
            content: (
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>{t('descRemoveMasterKey')}</Typography>
                    <Button
                        fullWidth
                        color="error"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true)

                            const newIdentity = GenerateIdentity()

                            const ckid = ComputeCKID(newIdentity.publicKey)
                            console.log('newkey: ', ckid)

                            client.api
                                .enactSubkey(ckid)
                                .then(() => {
                                    console.log('subkey enacted')
                                    const subkey = `concurrent-subkey ${newIdentity.privateKey} ${client.ccid}@${client.host} ${client.user?.profile?.username}`
                                    localStorage.setItem('SubKey', JSON.stringify(subkey))
                                    localStorage.removeItem('Identity')
                                    window.location.reload()
                                })
                                .catch((e) => {
                                    console.log('error: ', e)
                                })
                        }}
                    >
                        {processing ? t('processing') : t('ready')}
                    </Button>
                </Box>
            )
        }
    ]

    return (
        <Box>
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
                        {t('identification')}
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
                        {t('confidential')}
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
                                    {t('identifier')}
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {client?.ccid ?? t('undifined')}
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
                                    {t('masterKey')}
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
                        <Trans i18nKey={'settings.identity.switchMasterToSub.aboutMasterKey'} />
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
                            {t('reference')}
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
                                    {t('name')}
                                </td>
                                <td
                                    style={{
                                        border: '1px solid black',
                                        padding: '5px',
                                        textAlign: 'left'
                                    }}
                                >
                                    {client?.user?.profile?.username ?? t('unset')}
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
                                    {t('domain')}
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
                        <div>{t('addition')}</div>
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
                        {t('date')} {new Date().toLocaleDateString()}
                    </div>
                </div>
            </Box>
        </Box>
    )
}
