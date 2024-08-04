import { memo, useState } from 'react'
import { Box, Button, Divider, Tab, Tabs, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { BadgeList } from '../components/Badges/BadgeList'
import { useClient } from '../context/ClientContext'
import { useSnackbar } from 'notistack'
import { Registry } from '@cosmjs/proto-signing'

import { SigningStargateClient, defaultRegistryTypes } from '@cosmjs/stargate'
import { MsgCreateTemplate } from '../proto/concord'
import { BadgeManage } from '../components/Badges/BadgeManage'

type widgets = 'list' | 'manage'

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

export const BadgesPage = memo((): JSX.Element => {
    const path = useLocation()
    const tab: widgets = (path.hash.replace('#', '') as widgets) || 'debug'

    const { client } = useClient()
    const { enqueueSnackbar } = useSnackbar()

    const rpcEndpoint = 'https://concord-testseed.concrnt.net:26657'
    const [cosmJS, setCosmJS] = useState<SigningStargateClient | undefined>(undefined)

    if (!client?.ccid) {
        return <Box>Loading...</Box>
    }

    const pages: Record<string, JSX.Element> = {
        list: <BadgeList address={client.ccid} />,
        manage: cosmJS ? <BadgeManage address={client.ccid} cosmJS={cosmJS} /> : <Box>Connect Keplr first</Box>
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

            setCosmJS(
                await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner, {
                    registry
                })
            )
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
            <Typography variant="h2">BadgesPage</Typography>
            <Button
                disabled={!!cosmJS}
                onClick={() => {
                    connectKeplr()
                }}
            >
                {cosmJS ? 'Connected' : 'Connect Keplr'}
            </Button>
            <Divider />
            <Tabs
                value={tab}
                onChange={(_, next) => {
                    window.location.hash = next
                }}
                textColor="secondary"
                indicatorColor="secondary"
            >
                <Tab value="list" label="List" />
                <Tab value="manage" label="Manage" />
            </Tabs>
            <Divider />
            <Box sx={{ mt: '20px' }}>{pages[tab]}</Box>
        </Box>
    )
})

BadgesPage.displayName = 'BadgesPage'
