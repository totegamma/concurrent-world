import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type BadgeRef } from '@concurrent-world/client'
import { type Badge } from '../model'
import { Box, Divider, Paper, Typography } from '@mui/material'
import { CCUserChip } from '../components/ui/CCUserChip'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from 'notistack'
import { Registry } from '@cosmjs/proto-signing'
import { MsgCreateSeries, MsgMintBadge } from '../proto/concord'
import { SigningStargateClient, defaultRegistryTypes } from '@cosmjs/stargate'

export interface ConcordContextState {
    inspectBadge: (ref: BadgeRef) => void
    connectWallet: () => Promise<void>
    cosmJS: SigningStargateClient | undefined
}

const ConcordContext = createContext<ConcordContextState>({
    inspectBadge: () => {},
    connectWallet: async () => undefined,
    cosmJS: undefined
})

interface ConcordContextProps {
    children: JSX.Element | JSX.Element[]
}

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

export const ConcordProvider = ({ children }: ConcordContextProps): JSX.Element => {
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()

    const [inspectingBadgeRef, setInspectingBadgeRef] = useState<BadgeRef | null>(null)
    const inspectBadge = useCallback((ref: BadgeRef) => {
        setInspectingBadgeRef(ref)
    }, [])
    const endpoint = 'https://concord-testseed.concrnt.net'
    const badgeAPI = `${endpoint}/concrnt/concord/badge/get_badge/${inspectingBadgeRef?.seriesId}/${inspectingBadgeRef?.badgeId}`
    const ownersAPI = `${endpoint}/concrnt/concord/badge/get_badges_by_series/${inspectingBadgeRef?.seriesId}`
    const txQuery = 'https://concord-testseed.concrnt.net:26657/tx_search?query='
    const [badge, setBadge] = useState<Badge | null>(null)
    const [mintedTx, setMintedTx] = useState<any | null>(null)
    const [owners, setOwners] = useState<Badge[]>([])

    const rpcEndpoint = 'https://concord-testseed.concrnt.net:26657'
    const [cosmJS, setCosmJS] = useState<SigningStargateClient | undefined>(undefined)
    const [address, setAddress] = useState<string | undefined>(undefined)

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
            registry.register('/concord.badge.MsgCreateSeries', MsgCreateSeries)
            registry.register('/concord.badge.MsgMintBadge', MsgMintBadge)

            setCosmJS(
                await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner, {
                    registry
                })
            )

            setAddress((await offlineSigner.getAccounts())[0].address)
        }
    }

    useEffect(() => {
        if (!inspectingBadgeRef) {
            return
        }
        fetch(badgeAPI, {
            cache: 'force-cache'
        })
            .then((response) => response.json())
            .then((resp) => {
                setBadge(resp.badge)
            })

        fetch(ownersAPI)
            .then((response) => response.json())
            .then((resp) => {
                setOwners(resp.badges)
            })

        fetch(txQuery + `"cosmos.nft.v1beta1.EventMint.id='\\"${inspectingBadgeRef?.badgeId}\\"'"`)
            .then((response) => response.json())
            .then((resp) => {
                setMintedTx(resp.result.txs[0])
            })
    }, [inspectingBadgeRef])

    return (
        <ConcordContext.Provider
            value={{
                inspectBadge,
                connectWallet: connectKeplr,
                cosmJS
            }}
        >
            {children}
            <CCDrawer
                open={!!inspectingBadgeRef}
                onClose={() => {
                    setInspectingBadgeRef(null)
                }}
            >
                <Box
                    p={2}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    sx={{
                        userSelect: 'text'
                    }}
                >
                    <Typography variant="h1">Badge</Typography>
                    <Box display="flex" flexDirection="row" alignItems="center">
                        <Box
                            component="img"
                            src={badge?.uri}
                            sx={{
                                width: '100px',
                                height: '100px'
                            }}
                        />
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap={1}
                            flex={1}
                        >
                            <Typography variant="h2">{badge?.name}</Typography>
                            <Typography variant="caption">
                                SeriesID: {badge?.classId}
                                <br />
                                BadgeID: {badge?.badgeId}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="h3">Description</Typography>
                    <Typography variant="body1">{badge?.description}</Typography>

                    <Box display="flex" flexDirection="row" gap={1}>
                        <Typography variant="h3">Creator</Typography>
                        <CCUserChip avatar ccid={badge?.creator} />
                    </Box>

                    <Box display="flex" flexDirection="row" gap={1}>
                        <Typography variant="h3">Owner</Typography>
                        <CCUserChip avatar ccid={badge?.owner} />
                    </Box>

                    <Typography variant="h2">Minted at</Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1,
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setInspectingBadgeRef(null)
                            navigate(`/concord/explorer#${mintedTx?.hash}`)
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexShrink: 0,
                                p: 1
                            }}
                        >
                            @{mintedTx?.height}
                        </Box>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                p: 1
                            }}
                        >
                            0x{mintedTx?.hash.slice(0, 32)}...
                        </Box>
                    </Paper>

                    <Divider />
                    <Typography variant="h2">Series Owners</Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                        {owners?.map((badge: Badge) => (
                            <Box display="flex" flexDirection="row" gap={1} key={badge.badgeId} alignItems="center">
                                <Box
                                    component="img"
                                    src={badge.uri}
                                    sx={{
                                        width: '30px',
                                        height: '30px'
                                    }}
                                />
                                <CCUserChip avatar ccid={badge.owner} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CCDrawer>
        </ConcordContext.Provider>
    )
}

export function useConcord(): ConcordContextState {
    return useContext(ConcordContext)
}
