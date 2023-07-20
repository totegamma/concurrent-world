import { ListItemButton, type SxProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { type Stream } from '@concurrent-world/client'
import { useApi } from '../../context/api'
import PercentIcon from '@mui/icons-material/Percent'

export interface StreamLinkProps {
    id: string
    sx?: SxProps
}

export const StreamLink = (props: StreamLinkProps): JSX.Element | null => {
    const client = useApi()
    const [stream, SetStream] = useState<Stream | null>(null)

    useEffect(() => {
        client.getStream(props.id).then((e) => {
            SetStream(e)
        })
    }, [props.id])

    if (!stream) return null

    return (
        <>
            <ListItemButton dense component={RouterLink} to={`/stream#${props.id}`} sx={props.sx}>
                <PercentIcon />
                {stream.name}
            </ListItemButton>
        </>
    )
}
