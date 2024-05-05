import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type User, type Timeline, type CommunityTimelineSchema } from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import TagIcon from '@mui/icons-material/Tag'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'

export interface ListItemTimelineProps {
    timelineID: string
    sx?: SxProps
    onClick?: () => void
}

export const ListItemTimeline = (props: ListItemTimelineProps): JSX.Element | null => {
    const { client } = useClient()
    const [timeline, setTimeline] = useState<Timeline<CommunityTimelineSchema> | null | undefined>(null)
    const [userProfile, setUserProfile] = useState<User | null | undefined>(null)

    useEffect(() => {
        client.getTimeline<CommunityTimelineSchema>(props.timelineID).then((e) => {
            setTimeline(e)
            if (e && !e.document.body.name) {
                client.getUser(e.document.signer).then((user) => {
                    setUserProfile(user)
                })
            }
        })
    }, [props.timelineID])

    if (!timeline) {
        return (
            <ListItemButton dense disabled sx={props.sx}>
                <CloudOffIcon />
                offline
            </ListItemButton>
        )
    }

    return (
        <ListItemButton
            dense
            component={RouterLink}
            to={`/timeline/${props.timelineID}`}
            sx={props.sx}
            onClick={props.onClick}
        >
            {timeline?.domainOwned ? <TagIcon /> : <AlternateEmailIcon />}
            {timeline?.document.body.name || userProfile?.profile?.username || 'Unknown'}
        </ListItemButton>
    )
}
