import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Button,
    TextField,
    InputAdornment
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CCUserChip } from '../ui/CCUserChip'
import { CCDrawer } from '../ui/CCDrawer'

import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { type SigningStargateClient, type StdFee, coins } from '@cosmjs/stargate'
import { useSnackbar } from 'notistack'

export interface AssetsProps {
    address: string
    cosmJS?: SigningStargateClient
}

export const Assets = (props: AssetsProps): JSX.Element => {
    const endpoint = 'https://concord-testseed.concrnt.net'
    const balanceAPI = `${endpoint}/cosmos/bank/v1beta1/balances`
    const badgesAPI = `${endpoint}/concrnt/concord/badge/get_badges_by_owner`

    const [balance, setBalance] = useState<any>(null)
    const [badges, setBadges] = useState<any>(null)

    const [openSend, setOpenSend] = useState<boolean>(false)

    const [sendAmount, setSendAmount] = useState<string>('')
    const [sendRecipient, setSendRecipient] = useState<string>('')

    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        if (!props.address) return

        fetch(balanceAPI + '/' + props.address, {
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

        fetch(badgesAPI + '/' + props.address, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setBadges(data.badges)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [props.address])

    const sendTokens = async (): Promise<void> => {
        if (!props.cosmJS) return
        const sendMsg = {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
                fromAddress: props.address,
                toAddress: sendRecipient,
                amount: coins(sendAmount, 'uAmpere')
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

        const signResult = await props.cosmJS.signAndBroadcast(props.address, [sendMsg], defaultSendFee)

        enqueueSnackbar(signResult.code ? 'error' : 'Success', {
            variant: signResult.code ? 'error' : 'success'
        })
    }

    const uAmpere = balance?.balances?.find((b: any) => b.denom === 'uAmpere')?.amount ?? 0
    const mAmpere = uAmpere / 1000
    const Ampere = mAmpere / 1000

    return (
        <Box>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h2">Points</Typography>
                <Button
                    disabled={!props.cosmJS}
                    size="small"
                    onClick={() => {
                        setOpenSend(true)
                    }}
                    startIcon={<ArrowOutwardIcon />}
                >
                    送る
                </Button>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                <Tooltip
                    title={
                        <>
                            <Typography>={mAmpere}mA</Typography>
                            <Typography>={uAmpere}uA</Typography>
                        </>
                    }
                    placement="top"
                    arrow
                >
                    <Box display="flex" flexDirection="row" alignItems="baseline" gap={1}>
                        <Typography variant="h3" fontSize="2.5rem">
                            {Ampere}A
                        </Typography>
                        <Typography fontSize="1rem" variant="caption">
                            = $0
                        </Typography>
                    </Box>
                </Tooltip>
            </Box>
            <Typography variant="h2">Badges</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Visual</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>CreatedBy</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {badges?.map((b: any) => (
                        <TableRow key={b.id}>
                            <TableCell>
                                <img src={b.uri} width="50px" alt={b.id} />
                            </TableCell>
                            <TableCell>{b.name}</TableCell>
                            <TableCell>{b.description}</TableCell>
                            <TableCell>
                                <CCUserChip avatar ccid={b.creator} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CCDrawer
                open={openSend}
                onClose={() => {
                    setOpenSend(false)
                }}
            >
                <Box display="flex" flexDirection="column" gap={1} padding={2}>
                    <Typography variant="h2">送る</Typography>

                    <TextField
                        label="Amount"
                        value={sendAmount}
                        onChange={(e) => {
                            setSendAmount(e.target.value)
                        }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">uAmpere</InputAdornment>
                        }}
                    />

                    <TextField
                        label="Recipient"
                        value={sendRecipient}
                        onChange={(e) => {
                            setSendRecipient(e.target.value)
                        }}
                    />

                    <Button
                        onClick={() => {
                            sendTokens().then(() => {
                                setOpenSend(false)
                            })
                        }}
                    >
                        送る
                    </Button>
                </Box>
            </CCDrawer>
        </Box>
    )
}
