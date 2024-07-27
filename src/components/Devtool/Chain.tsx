import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { forwardRef, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { SigningStargateClient, coins, GasPrice, calculateFee } from '@cosmjs/stargate'
import { type StdFee } from '@keplr-wallet/types'

export const ChainDev = forwardRef<HTMLDivElement>((props, ref): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar()

    const endpoint = 'http://localhost:1317'
    const rpcEndpoint = 'http://localhost:26657'
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

            const defaultGasPrice = GasPrice.fromString('0.01utoken')
            const defaultSendFee: StdFee = calculateFee(80000, defaultGasPrice)

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
                <Button
                    disabled={!!address}
                    onClick={() => {
                        connectKeplr()
                    }}
                >
                    {address ? 'Connected' : 'Connect Keplr'}
                </Button>
                <Typography>{address}</Typography>
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
            </Box>
        </div>
    )
})

ChainDev.displayName = 'ChainDev'
