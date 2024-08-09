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
import { useConcord } from '../../context/ConcordContext'

export interface BadgeSeriesProps {
    address: string
    onDone?: (hash: string) => void
}

interface BadgeClass {
    id: string
    name: string
    description: string
    uri: string
    uri_hash: string
    data: {
        creator: string
        transferable: boolean
    }
}

export const BadgeSeries = (props: BadgeSeriesProps): JSX.Element => {
    const concord = useConcord()

    const endpoint = 'https://concord-testseed.concrnt.net'
    const classesAPI = `${endpoint}/concrnt/concord/badge/get_series_by_owner`
    const [processing, setProcessing] = useState<boolean>(false)

    const [series, setSeries] = useState<BadgeClass[]>([])

    const [createSeries, setCreateSeries] = useState<boolean>(false)
    const [seriesDraft, setSeriesDraft] = useState<DeepPartial<BadgeClass>>({})

    const [mintingSeries, setMintingSeries] = useState<string>('')
    const [mintUriDraft, setMintUriDraft] = useState<string>('')
    const [receiverDraft, setReceiverDraft] = useState<string>('')

    useEffect(() => {
        if (!props.address) return
        fetch(classesAPI + '/' + props.address, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setSeries(data.series)
            })
            .catch((err) => {
                console.error(err)
            })
    }, [props.address])

    const createBadgeSeries = async (): Promise<void> => {
        if (!concord.cosmJS) return
        const sendMsg = {
            typeUrl: '/concord.badge.MsgCreateSeries',
            value: {
                name: seriesDraft?.name,
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
                    amount: '1000'
                }
            ],
            gas: '200000'
        }

        setProcessing(true)
        const signResult = await concord.cosmJS
            .signAndBroadcast(props.address, [sendMsg], defaultSendFee)
            .finally(() => {
                setProcessing(false)
            })

        props.onDone?.(signResult?.transactionHash)
    }

    const mintBadge = async (): Promise<void> => {
        if (!concord.cosmJS) return
        const sendMsg = {
            typeUrl: '/concord.badge.MsgMintBadge',
            value: {
                creator: props.address,
                series: mintingSeries,
                uri: mintUriDraft,
                receiver: receiverDraft
            }
        }

        const defaultSendFee: StdFee = {
            amount: [
                {
                    denom: 'uAmpere',
                    amount: '1000'
                }
            ],
            gas: '200000'
        }

        setProcessing(true)
        const signResult = await concord.cosmJS
            .signAndBroadcast(props.address, [sendMsg], defaultSendFee)
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
                    disabled={processing || !concord.cosmJS}
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
                            <TableCell>Visual</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>isTransferable</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {series?.map((b: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <img src={b.uri} alt={b.name} width="64" height="64" />
                                </TableCell>
                                <TableCell>{b.name}</TableCell>
                                <TableCell>{b.description}</TableCell>
                                <TableCell>{b.data.transferable ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                    <Button
                                        disabled={!concord.cosmJS}
                                        onClick={() => {
                                            setMintingSeries(b.id)
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
                            createBadgeSeries().then(() => {
                                setCreateSeries(false)
                            })
                        }}
                    >
                        作成
                    </Button>
                </Box>
            </CCDrawer>
            <CCDrawer
                open={!!mintingSeries}
                onClose={() => {
                    setMintingSeries('')
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
                    <Typography>{mintingSeries}</Typography>
                    <TextField
                        label="Receiver"
                        value={receiverDraft}
                        onChange={(e) => {
                            setReceiverDraft(e.target.value)
                        }}
                    />
                    <TextField
                        label="URI"
                        value={mintUriDraft}
                        onChange={(e) => {
                            setMintUriDraft(e.target.value)
                        }}
                    />
                    <Button
                        disabled={processing}
                        onClick={() => {
                            mintBadge().then(() => {
                                setMintingSeries('')
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
