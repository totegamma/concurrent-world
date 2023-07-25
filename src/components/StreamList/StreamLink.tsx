import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type User, type Stream } from '@concurrent-world/client'
import { useApi } from '../../context/api'
import PercentIcon from '@mui/icons-material/Percent'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { type userHomeStream } from '../../model'

export interface StreamLinkProps {
    streamID: string
    sx?: SxProps
}

export const StreamLink = (props: StreamLinkProps): JSX.Element | null => {
    const client = useApi()
    const [stream, SetStream] = useState<Stream | null>(null)

    useEffect(() => {
        client.getStream(props.streamID).then((e) => {
            SetStream(e)
        })
    }, [props.streamID])

    if (!stream) return null

    return (
        <ListItemButton dense component={RouterLink} to={`/stream#${props.streamID}`} sx={props.sx}>
            <PercentIcon />
            {stream?.name}
        </ListItemButton>
    )
}

export interface UserStreamLinkProps {
    userHomeStream: userHomeStream
    sx?: SxProps
}

export const UserStreamLink = (props: UserStreamLinkProps): JSX.Element | null => {
    const client = useApi()
    const [user, SetUser] = useState<User | null>(null)

    useEffect(() => {
        client.getUser(props.userHomeStream.userID).then((e) => {
            SetUser(e)
        })
    }, [props.userHomeStream])

    if (!user) return null

    return (
        <ListItemButton dense component={RouterLink} to={`/entity/${props.userHomeStream.userID ?? ''}`} sx={props.sx}>
            <AlternateEmailIcon />
            {user?.profile?.username}
        </ListItemButton>
    )
}
