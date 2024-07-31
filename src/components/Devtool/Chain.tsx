import {
    Alert,
    Box,
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material'
import { forwardRef, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { SigningStargateClient, coins, GasPrice, calculateFee } from '@cosmjs/stargate'
import { type StdFee } from '@keplr-wallet/types'
import { CCDrawer } from '../ui/CCDrawer'
import { Codeblock } from '../ui/Codeblock'

export const ChainDev = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar()

    const endpoint = 'http://concord-testseed.concrnt.net:1317'
    const rpcEndpoint = 'http://concord-testseed.concrnt.net:26657'
    const balanceAPI = `${endpoint}/cosmos/bank/v1beta1/balances`
    const basgesAPI = `${endpoint}/concrnt/concord/badge/badges`

    const [address, setAddress] = useState<string>('')
    const [balance, setBalance] = useState<any>(null)
    const [badges, setBadges] = useState<any>(null)
    const [templates, setTemplates] = useState<any>(null)
    const [cosmJS, setCosmJS] = useState<SigningStargateClient | undefined>(undefined)

    const [sendAmount, setSendAmount] = useState<string>('')
    const [sendDenom, setSendDenom] = useState<string>('')
    const [sendRecipient, setSendRecipient] = useState<string>('')

    const [inspectTxDraft, setInspectTxDraft] = useState<string>('')
    const [inspectTxHash, setInspectTxHash] = useState<string>('')
    const [inspectedTx, setInspectedTx] = useState<any>(null)

    useEffect(() => {
        if (inspectTxHash) {
            fetch(`${rpcEndpoint}/tx?hash=${inspectTxHash}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    setInspectedTx(data)
                })
                .catch((err) => {
                    console.error(err)
                })
        }
    }, [inspectTxHash])

    useEffect(() => {
        if (address) {
            fetch(balanceAPI + '/' + address, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    setBalance(data)
                })
                .catch((err) => {
                    console.error(err)
                })

            fetch(basgesAPI + '/' + address, {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    setBadges(data.nfts)
                    const classmap = new Map<string, any>()
                    for (const cls of data.classes) {
                        classmap.set(cls.id, cls)
                    }
                    setTemplates(classmap)
                })
                .catch((err) => {
                    console.error(err)
                })
        }
    }, [address])

    const connectKeplr = async (): Promise<void> => {
        if (!window.keplr) {
            enqueueSnackbar('Keplr not found', { variant: 'error' })
        } else {
            enqueueSnackbar('Keplr found', { variant: 'success' })

            const chainId = 'concord'
            await window.keplr.enable(chainId)
            window.keplr.defaultOptions = {
                sign: {
                    preferNoSetFee: true,
                    preferNoSetMemo: true
                }
            }
            const offlineSigner = window.keplr.getOfflineSigner(chainId)
            const accounts = await offlineSigner.getAccounts()
            setAddress(accounts[0].address)
            setCosmJS(await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner))
        }
    }

    const sendTokens = async (): Promise<void> => {
        if (!cosmJS) {
            enqueueSnackbar('CosmJS not found', { variant: 'error' })
        } else {
            const sendMsg = {
                typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                value: {
                    fromAddress: address,
                    toAddress: sendRecipient,
                    amount: coins(sendAmount, sendDenom)
                }
            }

            const defaultSendFee: StdFee = {
                amount: [],
                gas: '200000'
            }

            const signResult = await cosmJS.signAndBroadcast(address, [sendMsg], defaultSendFee)
            enqueueSnackbar(signResult.code ? signResult.rawLog : 'Success', {
                variant: signResult.code ? 'error' : 'success'
            })

            console.log(signResult)
        }
    }

    return (
        <div ref={ref} {...props}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%'
                }}
            >
                <Typography variant="h3">ChainDev</Typography>
                <Typography>{address}</Typography>
                <Button
                    disabled={!!address}
                    onClick={() => {
                        connectKeplr()
                    }}
                >
                    {address ? 'Connected' : 'Connect Keplr'}
                </Button>
                <Divider />
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Denom</TableCell>
                            <TableCell>Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {balance?.balances?.map((b: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell>{b.denom}</TableCell>
                                <TableCell>{b.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Divider />
                <Box>
                    <Typography variant="h5">Badges</Typography>
                    {badges?.map((b: any) => (
                        <Box
                            key={b.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                        >
                            <img src={templates?.get(b.class_id)?.uri} width="50px" alt={b.id} />
                            <Typography>{templates?.get(b.class_id)?.name}</Typography>
                            <Typography>{templates?.get(b.class_id)?.description}</Typography>
                            <Typography>{templates?.get(b.class_id)?.data?.creator}</Typography>
                        </Box>
                    ))}
                </Box>
                <Divider />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    <TextField
                        label="Recipient"
                        value={sendRecipient}
                        onChange={(e) => {
                            setSendRecipient(e.target.value)
                        }}
                    />
                    <TextField
                        label="Denom"
                        value={sendDenom}
                        onChange={(e) => {
                            setSendDenom(e.target.value)
                        }}
                    />
                    <TextField
                        label="Amount"
                        value={sendAmount}
                        onChange={(e) => {
                            setSendAmount(e.target.value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            sendTokens()
                        }}
                    >
                        Send
                    </Button>
                </Box>
                <Divider />
                <TextField
                    label="Inspect Tx"
                    placeholder="0xE4F706D0B3D255954D344CCE4BBDFF51F3B3A2B76B4AB63867F421639670343A"
                    value={inspectTxDraft}
                    onChange={(e) => {
                        let hash = e.target.value
                        if (!hash.startsWith('0x')) {
                            hash = '0x' + hash
                        }
                        setInspectTxDraft(hash)
                    }}
                />
                <Button
                    onClick={() => {
                        setInspectTxHash(inspectTxDraft)
                    }}
                >
                    Inspect
                </Button>
                <CCDrawer
                    open={!!inspectTxHash}
                    onClose={() => {
                        setInspectTxHash('')
                    }}
                >
                    <Box
                        sx={{
                            p: 1,
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            userSelect: 'text'
                        }}
                    >
                        <Typography variant="h1">Inspect Tx</Typography>
                        {inspectedTx && (
                            <>
                                <Typography variant="h2">Hash</Typography>
                                <Typography>
                                    {inspectedTx.result.hash}@{inspectedTx.result.height}
                                </Typography>
                                {/*
                            <Typography>{inspectedTx.result.tx_result.code}</Typography>
                            */}

                                {inspectedTx.result.tx_result.log && (
                                    <Alert severity="error">{inspectedTx.result.tx_result.log}</Alert>
                                )}

                                <Typography variant="h2">Fee</Typography>
                                <Typography>
                                    used {inspectedTx.result.tx_result.gas_used} / wanted{' '}
                                    {inspectedTx.result.tx_result.gas_wanted}
                                </Typography>

                                <Typography variant="h2">Events</Typography>
                                <Codeblock language="json">
                                    {JSON.stringify(inspectedTx.result.tx_result.events, null, 2)}
                                </Codeblock>
                            </>
                        )}
                    </Box>
                </CCDrawer>
            </Box>
        </div>
    )
})

ChainDev.displayName = 'ChainDev'
