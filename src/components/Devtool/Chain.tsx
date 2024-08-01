import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    List,
    ListItemButton,
    ListItemText,
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
import { SigningStargateClient, coins } from '@cosmjs/stargate'
import { type StdFee } from '@keplr-wallet/types'
import { CCDrawer } from '../ui/CCDrawer'
import { Codeblock } from '../ui/Codeblock'

export const ChainDev = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar()

    const endpoint = 'https://concord-testseed.concrnt.net'
    const rpcEndpoint = 'https://concord-testseed.concrnt.net:26657'
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

    const [processing, setProcessing] = useState<boolean>(false)

    const [recentTxs, setRecentTxs] = useState<any>(null)

    useEffect(() => {
        fetch(`${rpcEndpoint}/tx_search?query="tx.height>0"&order_by="desc"`, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setRecentTxs(data)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [])

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
                amount: [
                    {
                        denom: 'uAmpere',
                        amount: '500'
                    }
                ],
                gas: '100000'
            }

            setProcessing(true)
            const signResult = await cosmJS.signAndBroadcast(address, [sendMsg], defaultSendFee).finally(() => {
                setProcessing(false)
            })

            enqueueSnackbar(signResult.code ? signResult.rawLog : 'Success', {
                variant: signResult.code ? 'error' : 'success'
            })

            setInspectTxDraft(signResult.transactionHash)

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
                        disabled={processing || !sendAmount || !sendDenom || !sendRecipient || !cosmJS}
                        onClick={() => {
                            sendTokens()
                        }}
                    >
                        {processing ? 'Sending...' : 'Send'}
                    </Button>
                </Box>
                <Divider />
                <TextField
                    label="Inspect Tx"
                    placeholder="0xE4F706D0B3D255954D344CCE4BBDFF51F3B3A2B76B4AB63867F421639670343A"
                    value={inspectTxDraft}
                    onChange={(e) => {
                        setInspectTxDraft(e.target.value)
                    }}
                />
                <Button
                    disabled={!inspectTxDraft}
                    onClick={() => {
                        setInspectTxHash(inspectTxDraft.startsWith('0x') ? inspectTxDraft : '0x' + inspectTxDraft)
                    }}
                >
                    Inspect
                </Button>
                <Divider />
                <Typography variant="h3">Recent Transactions</Typography>
                <List disablePadding>
                    {recentTxs?.result?.txs?.map((tx: any, i: number) => (
                        <ListItemButton
                            key={i}
                            onClick={() => {
                                setInspectTxHash(`0x${tx.hash}`)
                            }}
                        >
                            <ListItemText
                                primary={`${tx.hash.slice(0, 10)}...${tx.hash.slice(-10)}@${tx.height}`}
                                secondary={tx.tx_result.code ? 'Error' : 'Success'}
                            />
                        </ListItemButton>
                    ))}
                </List>
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
                                    {inspectedTx.result?.hash}@{inspectedTx.result?.height}
                                </Typography>

                                {inspectedTx.result?.tx_result?.log && (
                                    <Alert severity="error">
                                        <AlertTitle>Transaction Error</AlertTitle>
                                        {inspectedTx.result.tx_result.log}
                                    </Alert>
                                )}

                                <Typography variant="h2">Fee</Typography>
                                <Typography>
                                    used {inspectedTx.result?.tx_result?.gas_used} / wanted{' '}
                                    {inspectedTx.result?.tx_result?.gas_wanted}
                                </Typography>

                                <Typography variant="h2">Events</Typography>
                                <Codeblock language="json">
                                    {JSON.stringify(inspectedTx.result?.tx_result?.events, null, 2)}
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
