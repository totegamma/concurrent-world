import { type SigningStargateClient, type StdFee } from '@cosmjs/stargate'
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Checkbox
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CCDrawer } from '../ui/CCDrawer'
import { type DeepPartial } from '../../util'

export interface BadgeManageProps {
    address: string
    cosmJS: SigningStargateClient
    onDone?: (hash: string) => void
}

interface BadgeSeries {
    id: string
    name: string
    symbol: string
    description: string
    uri: string
    uri_hash: string
    data: {
        creator: string
        transferable: boolean
    }
}

export const BadgeManage = (props: BadgeManageProps): JSX.Element => {
    const endpoint = 'https://concord-testseed.concrnt.net'
    const classesAPI = `${endpoint}/cosmos/nft/v1beta1/classes`
    const [processing, setProcessing] = useState<boolean>(false)

    const [series, setSeries] = useState<BadgeSeries[]>([])
    const mySeries = series.filter((c: BadgeSeries) => c.data?.creator === props.address)

    const [createSeries, setCreateSeries] = useState<boolean>(false)
    const [seriesDraft, setSeriesDraft] = useState<DeepPartial<BadgeSeries>>({})

    const [mintingClass, setMintingClass] = useState<string>('')
    const [receiverDraft, setReceiverDraft] = useState<string>('')

    useEffect(() => {
        if (!props.address) return
        fetch(classesAPI, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setSeries(data.classes)
                console.log(data)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [props.address])

    const createBadgeTemplate = async (): Promise<void> => {
        const sendMsg = {
            typeUrl: '/concord.badge.MsgCreateTemplate',
            value: {
                name: seriesDraft?.name,
                // symbol: seriesDraft?.symbol,
                description: seriesDraft?.description,
                uri: seriesDraft?.uri,
                creator: props.address,
                transferable: true
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
        const signResult = await props.cosmJS
            .signAndBroadcast(props.address, [sendMsg], defaultSendFee, 'mymsg')
            .finally(() => {
                setProcessing(false)
            })

        props.onDone?.(signResult?.transactionHash)
    }

    const mintBadge = async (): Promise<void> => {
        const sendMsg = {
            typeUrl: '/concord.badge.MsgMintBadge',
            value: {
                creator: props.address,
                class: mintingClass,
                receiver: receiverDraft
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
        const signResult = await props.cosmJS
            .signAndBroadcast(props.address, [sendMsg], defaultSendFee, 'mymsg')
            .finally(() => {
                setProcessing(false)
            })

        props.onDone?.(signResult?.transactionHash)
    }

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant="h3">シリーズ</Typography>
                <Button
                    disabled={processing}
                    onClick={() => {
                        setCreateSeries(true)
                    }}
                >
                    + 新規
                </Button>
            </Box>
            <Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Symbol</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>isTransferable</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mySeries?.map((b: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell>{b.symbol}</TableCell>
                                <TableCell>{b.name}</TableCell>
                                <TableCell>{b.description}</TableCell>
                                <TableCell>{b.data.transferable ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => {
                                            setMintingClass(b.id)
                                        }}
                                    >
                                        発行
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <CCDrawer
                open={createSeries}
                onClose={() => {
                    setCreateSeries(false)
                }}
            >
                <Box
                    sx={{
                        p: 1,
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'text',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Typography variant="h3">新規シリーズ</Typography>
                    <TextField
                        label="Name"
                        value={seriesDraft?.name}
                        onChange={(e) => {
                            setSeriesDraft({ ...seriesDraft, name: e.target.value })
                        }}
                    />
                    <TextField
                        label="Symbol"
                        value={seriesDraft?.symbol}
                        onChange={(e) => {
                            setSeriesDraft({ ...seriesDraft, symbol: e.target.value })
                        }}
                    />
                    <TextField
                        label="Description"
                        value={seriesDraft?.description}
                        onChange={(e) => {
                            setSeriesDraft({ ...seriesDraft, description: e.target.value })
                        }}
                    />
                    <TextField
                        label="URI"
                        value={seriesDraft?.uri}
                        onChange={(e) => {
                            setSeriesDraft({ ...seriesDraft, uri: e.target.value })
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography>Transferable</Typography>
                        <Checkbox
                            checked={seriesDraft?.data?.transferable}
                            onChange={(e) => {
                                setSeriesDraft({
                                    ...seriesDraft,
                                    data: { ...seriesDraft?.data, transferable: e.target.checked }
                                })
                            }}
                        />
                    </Box>
                    <Button
                        disabled={processing}
                        onClick={() => {
                            createBadgeTemplate().then(() => {
                                setCreateSeries(false)
                            })
                        }}
                    >
                        作成
                    </Button>
                </Box>
            </CCDrawer>
            <CCDrawer
                open={!!mintingClass}
                onClose={() => {
                    setMintingClass('')
                }}
            >
                <Box
                    sx={{
                        p: 1,
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'text',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}
                >
                    <Typography variant="h3">バッジ発行</Typography>
                    <TextField
                        label="Receiver"
                        value={receiverDraft}
                        onChange={(e) => {
                            setReceiverDraft(e.target.value)
                        }}
                    />
                    <Button
                        disabled={processing}
                        onClick={() => {
                            mintBadge().then(() => {
                                setMintingClass('')
                            })
                        }}
                    >
                        発行
                    </Button>
                </Box>
            </CCDrawer>
        </Box>
    )
}
