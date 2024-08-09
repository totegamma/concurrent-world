import { useEffect, useState } from 'react'
import { type Badge } from '../../model'
import { Box, type SxProps, Tooltip } from '@mui/material'
import { type BadgeRef } from '@concurrent-world/client'
import { useGlobalActions } from '../../context/GlobalActions'

export interface ConcordBadgeProps {
    badgeRef: BadgeRef
    sx?: SxProps
}

export const ConcordBadge = (props: ConcordBadgeProps): JSX.Element => {
    const actions = useGlobalActions()
    const [badge, setBadge] = useState<Badge | null>(null)

    // --- TEMPORARY CODE --- (from Assets.tsx)
    const endpoint = 'https://concord-testseed.concrnt.net'
    const badgeAPI = `${endpoint}/concrnt/concord/badge/get_badge/${props.badgeRef.seriesId}/${props.badgeRef.badgeId}`
    // --- TEMPORARY CODE ---

    useEffect(() => {
        fetch(badgeAPI, {
            cache: 'force-cache'
        })
            .then((response) => response.json())
            .then((resp) => {
                setBadge(resp.badge)
            })
    }, [props.badgeRef.badgeId, props.badgeRef.seriesId])

    return (
        <Tooltip arrow title={badge?.name} placement="top">
            <Box
                onClick={() => {
                    actions.inspectBadge(props.badgeRef)
                }}
                component="img"
                src={badge?.uri}
                sx={{
                    ...props.sx,
                    cursor: 'pointer'
                }}
            />
        </Tooltip>
    )
}
