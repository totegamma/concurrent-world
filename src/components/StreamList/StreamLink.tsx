import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type User, type Stream } from '@concurrent-world/client'
import { useApi } from '../../context/api'
import PercentIcon from '@mui/icons-material/Percent'
import { type Followable } from '../../model'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'

export interface StreamLinkProps {
    followable: Followable
    sx?: SxProps
}

export const StreamLink = (props: StreamLinkProps): JSX.Element | null => {
    const client = useApi()
    const [stream, SetStream] = useState<Stream | null>(null)
    const [user, SetUser] = useState<User | null>(null)

    useEffect(() => {
        if (props.followable.type === 'user') {
            client.getUser(props.followable.userID!).then((e) => {
                SetUser(e)
            })
        } else if (props.followable.type === 'stream') {
            client.getStream(props.followable.id).then((e) => {
                SetStream(e)
            })
        }
    }, [props.followable])

    if (!stream && !user) return null

    return (
        <>
            {props.followable.type === 'user' ? (
                <ListItemButton
                    dense
                    component={RouterLink}
                    to={`/entity/${props.followable.userID ?? ''}`}
                    sx={props.sx}
                >
                    <AlternateEmailIcon />
                    {user?.profile?.username}
                </ListItemButton>
            ) : (
                <ListItemButton dense component={RouterLink} to={`/stream#${props.followable.id}`} sx={props.sx}>
                    <PercentIcon />
                    {stream?.name}
                </ListItemButton>
            )}
        </>
    )
}
