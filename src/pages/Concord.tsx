import { memo, useState } from 'react'
import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useClient } from '../context/ClientContext'
import { useSnackbar } from 'notistack'
import { Registry } from '@cosmjs/proto-signing'

import { SigningStargateClient, defaultRegistryTypes } from '@cosmjs/stargate'
import { MsgCreateTemplate, MsgMintBadge } from '../proto/concord'
import { Assets } from '../components/Concord/Assets'
import { BadgeSeries } from '../components/Concord/BadgeSeries'

type widgets = 'assets' | 'badge'

const chainInfo = {
    chainId: 'concord',
    chainName: 'Concord',
    rpc: 'https://concord-testseed.concrnt.net:26657',
    rest: 'https://concord-testseed.concrnt.net',
    bip44: {
        coinType: 118
    },
    bech32Config: {
        bech32PrefixAccAddr: 'con',
        bech32PrefixAccPub: 'con' + 'pub',
        bech32PrefixValAddr: 'con' + 'valoper',
        bech32PrefixValPub: 'con' + 'valoperpub',
        bech32PrefixConsAddr: 'con' + 'valcons',
        bech32PrefixConsPub: 'con' + 'valconspub'
    },
    currencies: [
        {
            coinDenom: 'Ampere',
            coinMinimalDenom: 'uAmpere',
            coinDecimals: 6
        }
    ],
    feeCurrencies: [
        {
            coinDenom: 'Ampere',
            coinMinimalDenom: 'uAmpere',
            coinDecimals: 6
        }
    ],
    stakeCurrency: {
        coinDenom: 'Ampere',
        coinMinimalDenom: 'uAmpere',
        coinDecimals: 6
    }
}

export const ConcordPage = memo((): JSX.Element => {
    const navigate = useNavigate()
    const location = useLocation()
    const tab = location.pathname.split('/').pop() as widgets

    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()
    const [address, setAddress] = useState<string | undefined>(undefined)

    const rpcEndpoint = 'https://concord-testseed.concrnt.net:26657'
    const [cosmJS, setCosmJS] = useState<SigningStargateClient | undefined>(undefined)

    if (!client?.ccid) {
        return <Box>Loading...</Box>
    }

    const connectKeplr = async (): Promise<void> => {
        if (!window.keplr) {
            enqueueSnackbar('Keplr not found', { variant: 'error' })
        } else {
            enqueueSnackbar('Keplr found', { variant: 'success' })

            window.keplr.experimentalSuggestChain(chainInfo)

            const chainId = 'concord'
            await window.keplr.enable(chainId)
            window.keplr.defaultOptions = {
                sign: {
                    preferNoSetFee: true,
                    preferNoSetMemo: true
                }
            }
            const offlineSigner = window.keplr.getOfflineSigner(chainId)

            const registry = new Registry(defaultRegistryTypes)
            registry.register('/concord.badge.MsgCreateTemplate', MsgCreateTemplate)
            registry.register('/concord.badge.MsgMintBadge', MsgMintBadge)

            setCosmJS(
                await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner, {
                    registry
                })
            )

            setAddress((await offlineSigner.getAccounts())[0].address)
        }
    }

    return (
        <Box
            sx={{
                paddingX: 1,
                paddingTop: 1,
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll',
                overflowX: 'hidden'
            }}
        >
            <Typography variant="h2">Concord Network</Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    my: 1
                }}
            >
                <Typography>{address ? `Connected as ${address}` : 'Not connected'}</Typography>
                <Button
                    disabled={!!cosmJS}
                    onClick={() => {
                        connectKeplr()
                    }}
                >
                    {cosmJS ? 'Connected' : 'Connect Keplr'}
                </Button>
            </Box>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, v) => {
                    navigate(`/concord/${v}`)
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab value="assets" label="Assets" />
                <Tab value="badge" label="Badge" />
            </Tabs>
            <Divider />
            <Routes>
                <Route path="/assets" element={<Assets address={client.ccid} cosmJS={cosmJS} />} />
                <Route path="/badge" element={<BadgeSeries address={client.ccid} cosmJS={cosmJS} />} />
            </Routes>
        </Box>
    )
})

ConcordPage.displayName = 'ConcordPage'
