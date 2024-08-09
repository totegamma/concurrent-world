import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type BadgeRef } from '@concurrent-world/client'
import { type Badge } from '../model'
import { Box, Divider, Paper, Typography } from '@mui/material'
import { CCUserChip } from '../components/ui/CCUserChip'
import { useNavigate } from 'react-router-dom'
import { type StdFee, coins, type DeliverTxResponse } from '@cosmjs/stargate'

import { useSnackbar } from 'notistack'
import { Registry } from '@cosmjs/proto-signing'
import { MsgCreateSeries, MsgMintBadge } from '../proto/concord'
import { SigningStargateClient, defaultRegistryTypes } from '@cosmjs/stargate'

export interface ConcordContextState {
    inspectBadge: (ref: BadgeRef) => void
    connectWallet: () => Promise<void>
    cosmJS: SigningStargateClient | undefined
    getBalance: (addr: string) => Promise<any>
    getBadge: (seriesId: string, badgeId: string) => Promise<Badge | null>
    getBadges: (owner: string) => Promise<Badge[]>
    getSeries: (owner: string) => Promise<BadgeSeriesType[]>
    sendTokens: (to: string, amount: string) => Promise<DeliverTxResponse | null>
    createBadgeSeries: (
        name: string,
        description: string,
        uri: string,
        transferable: boolean
    ) => Promise<DeliverTxResponse | null>
    mintBadge: (series: string, uri: string, receiver: string) => Promise<DeliverTxResponse | null>
}

export interface BadgeSeriesType {
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

const ConcordContext = createContext<ConcordContextState>({
    inspectBadge: () => {},
    connectWallet: async () => undefined,
    cosmJS: undefined,
    getBalance: async () => undefined,
    getBadges: async () => [],
    getBadge: async () => null,
    getSeries: async () => [],
    sendTokens: async () => null,
    createBadgeSeries: async () => null,
    mintBadge: async () => null
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
    const balanceAPI = `${endpoint}/cosmos/bank/v1beta1/balances`
    const badgesAPI = `${endpoint}/concrnt/concord/badge/get_badges_by_owner`
    const seriesAPI = `${endpoint}/concrnt/concord/badge/get_series_by_owner`
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

    const getBalance = async (addr: string): Promise<any> => {
        return await fetch(balanceAPI + '/' + addr, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                return data
            })
            .catch((err) => {
                console.error(err)
            })
    }

    const getBadges = async (owner: string): Promise<Badge[]> => {
        return await fetch(badgesAPI + '/' + owner, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                return data.badges
            })
            .catch((err) => {
                console.error(err)
            })
    }

    const badgeCache: Record<string, Promise<Badge | null>> = {}
    const getBadge = async (seriesId: string, badgeId: string): Promise<Badge | null> => {
        const cacheKey = `${seriesId}/${badgeId}`
        if (cacheKey in badgeCache) {
            return await badgeCache[cacheKey]
        }
        const badgeAPI = `${endpoint}/concrnt/concord/badge/get_badge/${seriesId}/${badgeId}`
        badgeCache[cacheKey] = fetch(badgeAPI, {
            cache: 'force-cache'
        })
            .then((response) => response.json())
            .then((resp) => {
                return resp.badge
            })
        return await badgeCache[cacheKey]
    }

    const getSeries = async (owner: string): Promise<BadgeSeriesType[]> => {
        return await fetch(seriesAPI + '/' + owner, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                return data.series
            })
            .catch((err) => {
                console.error(err)
            })
    }

    const sendTokens = async (to: string, amount: string): Promise<DeliverTxResponse | null> => {
        if (!cosmJS || !address) return null

        const sendMsg = {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
                fromAddress: address,
                toAddress: to,
                amount: coins(amount, 'uAmpere')
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

        const signResult = await cosmJS.signAndBroadcast(address, [sendMsg], defaultSendFee)

        enqueueSnackbar(signResult.code ? 'error' : 'Success', {
            variant: signResult.code ? 'error' : 'success'
        })

        return signResult
    }

    const createBadgeSeries = async (
        name: string,
        description: string,
        uri: string,
        transferable: boolean
    ): Promise<DeliverTxResponse | null> => {
        if (!cosmJS || !address) return null
        const sendMsg = {
            typeUrl: '/concord.badge.MsgCreateSeries',
            value: {
                name,
                description,
                uri,
                creator: address,
                transferable
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

        return await cosmJS.signAndBroadcast(address, [sendMsg], defaultSendFee)
    }

    const mintBadge = async (series: string, uri: string, receiver: string): Promise<DeliverTxResponse | null> => {
        if (!cosmJS || !address) return null
        const sendMsg = {
            typeUrl: '/concord.badge.MsgMintBadge',
            value: {
                creator: address,
                series,
                uri,
                receiver
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

        return await cosmJS.signAndBroadcast(address, [sendMsg], defaultSendFee)
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
                cosmJS,
                getBalance,
                getBadges,
                getBadge,
                getSeries,
                sendTokens,
                createBadgeSeries,
                mintBadge
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
