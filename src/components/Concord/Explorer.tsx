import {
    Box,
    Typography,
    Button,
    TextField,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Alert,
    AlertTitle
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CCDrawer } from '../ui/CCDrawer'

import { type DecodedTxRaw, decodeTxRaw } from '@cosmjs/proto-signing'
import { fromBase64 } from '@cosmjs/encoding'
import { EventCard } from '../ui/EventCard'
import { useLocation } from 'react-router-dom'

export const ConcordExplorer = (): JSX.Element => {
    const rpcEndpoint = 'https://concord-testseed.concrnt.net:26657'

    const [inspectTxDraft, setInspectTxDraft] = useState<string>('')
    const [inspectTxHash, setInspectTxHash] = useState<string>('')
    const [inspectedTx, setInspectedTx] = useState<any>(null)

    const [recentTxs, setRecentTxs] = useState<any>(null)

    const inspectedTxRaw = inspectedTx?.result?.tx
    const inspectedTxRawDecoded: DecodedTxRaw | undefined = inspectedTxRaw
        ? decodeTxRaw(fromBase64(inspectedTxRaw))
        : undefined

    const path = useLocation()
    const inspectHash = path.hash.replace('#', '')

    useEffect(() => {
        if (inspectHash?.length === 64) {
            if (inspectHash.startsWith('0x')) setInspectTxHash(inspectHash)
            else setInspectTxHash('0x' + inspectHash)
        }

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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    width: '100%'
                }}
            >
                <TextField
                    fullWidth
                    label="Inspect Tx"
                    placeholder="0xE4F706D0B3D255954D344CCE4BBDFF51F3B3A2B76B4AB63867F421639670343A"
                    value={inspectTxDraft}
                    onChange={(e) => {
                        setInspectTxDraft(e.target.value)
                    }}
                />
                <Button
                    sx={{
                        height: '100%'
                    }}
                    disabled={!inspectTxDraft}
                    onClick={() => {
                        setInspectTxHash(inspectTxDraft.startsWith('0x') ? inspectTxDraft : '0x' + inspectTxDraft)
                    }}
                >
                    Inspect
                </Button>
            </Box>
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

                            <Typography variant="h2">Transaction</Typography>
                            <Typography>memo: {inspectedTxRawDecoded?.body?.memo || '<none>'}</Typography>
                            <Typography>messages:</Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                {inspectedTxRawDecoded?.body?.messages?.map((m, i) => (
                                    <Box key={i}>
                                        <Typography>{m.typeUrl}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Typography variant="h2">Fee</Typography>
                            <Typography>
                                used {inspectedTx.result?.tx_result?.gas_used} / wanted{' '}
                                {inspectedTx.result?.tx_result?.gas_wanted}
                            </Typography>

                            <Typography variant="h2">Events</Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                            >
                                {inspectedTx.result?.tx_result?.events?.map((e: any, i: number) => (
                                    <EventCard key={i} id={`${i}`} label={e.type} content={e.attributes} />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>
            </CCDrawer>
        </Box>
    )
}
