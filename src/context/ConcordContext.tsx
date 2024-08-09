import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type BadgeRef } from '@concurrent-world/client'
import { type Badge } from '../model'
import { Box, Divider, Paper, Typography } from '@mui/material'
import { CCUserChip } from '../components/ui/CCUserChip'
import { useNavigate } from 'react-router-dom'

export interface ConcordContextState {
    inspectBadge: (ref: BadgeRef) => void
}

const ConcordContext = createContext<ConcordContextState>({
    inspectBadge: () => {}
})

interface ConcordContextProps {
    children: JSX.Element | JSX.Element[]
}

export const ConcordProvider = ({ children }: ConcordContextProps): JSX.Element => {
    const navigate = useNavigate()

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
                inspectBadge
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
