import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type User, type Timeline, type CommunityTimelineSchema, IsCSID } from '@concurrent-world/client'
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

    const split = props.timelineID.split('@')
    const isUserTimeline = split[0] === 'world.concrnt.t-home'
    const link = isUserTimeline ? `/${split[1]}` : `/timeline/${props.timelineID}`

    return (
        <ListItemButton dense component={RouterLink} to={link} sx={props.sx} onClick={props.onClick}>
            {IsCSID(timeline?.owner) ? <TagIcon /> : <AlternateEmailIcon />}
            {timeline?.document.body.name || userProfile?.profile?.username || 'Unknown'}
        </ListItemButton>
    )
}
