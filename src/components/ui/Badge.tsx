import { useEffect, useState } from 'react'
import { type Badge } from '../../model'
import { Box, type SxProps, Tooltip } from '@mui/material'

export interface ConcordBadgeProps {
    seriesId: string
    badgeId: string
    sx?: SxProps
}

export const ConcordBadge = (props: ConcordBadgeProps): JSX.Element => {
    const [badge, setBadge] = useState<Badge | null>(null)

    // --- TEMPORARY CODE --- (from Assets.tsx)
    const endpoint = 'https://concord-testseed.concrnt.net'
    const badgeAPI = `${endpoint}/concrnt/concord/badge/get_badge/${props.seriesId}/${props.badgeId}`
    // --- TEMPORARY CODE ---

    useEffect(() => {
        fetch(badgeAPI, {
            cache: 'force-cache'
        })
            .then((response) => response.json())
            .then((resp) => {
                setBadge(resp.badge)
            })
    }, [props.badgeId, props.seriesId])

    return (
        <Tooltip arrow title={badge?.name} placement="top">
            <Box component="img" src={badge?.uri} sx={props.sx} />
        </Tooltip>
    )
}
