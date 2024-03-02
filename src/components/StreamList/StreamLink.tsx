import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type User, type Stream, type CommonstreamSchema } from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import PercentIcon from '@mui/icons-material/Percent'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import { type userHomeStream } from '../../model'

export interface StreamLinkProps {
    streamID: string
    sx?: SxProps
    onClick?: () => void
}

export const StreamLink = (props: StreamLinkProps): JSX.Element | null => {
    const { client } = useClient()
    const [stream, SetStream] = useState<Stream<CommonstreamSchema> | null | undefined>(null)

    useEffect(() => {
        client.getStream<CommonstreamSchema>(props.streamID).then((e) => {
            SetStream(e)
        })
    }, [props.streamID])

    if (!stream) {
        return (
            <ListItemButton dense disabled component={RouterLink} to={`/stream/${props.streamID}`} sx={props.sx}>
                <PercentIcon />
                offline
            </ListItemButton>
        )
    }

    return (
        <ListItemButton
            dense
            component={RouterLink}
            to={`/stream/${props.streamID}`}
            sx={props.sx}
            onClick={props.onClick}
        >
            <PercentIcon />
            {stream?.payload.name}
        </ListItemButton>
    )
}

export interface UserStreamLinkProps {
    userHomeStream: userHomeStream
    sx?: SxProps
    onClick?: () => void
}

export const UserStreamLink = (props: UserStreamLinkProps): JSX.Element | null => {
    const { client } = useClient()
    const [user, SetUser] = useState<User | null | undefined>(null)

    useEffect(() => {
        client.getUser(props.userHomeStream.userID).then((e) => {
            SetUser(e)
        })
    }, [props.userHomeStream])

    if (!user) {
        return (
            <ListItemButton
                dense
                disabled
                component={RouterLink}
                to={`/entity/${props.userHomeStream.userID ?? ''}`}
                sx={props.sx}
                onClick={props.onClick}
            >
                <AlternateEmailIcon />
                offline
            </ListItemButton>
        )
    }

    return (
        <ListItemButton
            dense
            component={RouterLink}
            to={`/entity/${props.userHomeStream.userID ?? ''}`}
            sx={props.sx}
            onClick={props.onClick}
        >
            <AlternateEmailIcon />
            {user?.profile?.payload.body.username}
        </ListItemButton>
    )
}
