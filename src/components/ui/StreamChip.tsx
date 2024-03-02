import { Tooltip, Paper, Chip } from '@mui/material'
import { type Stream } from '@concurrent-world/client'
import { Link as NavLink } from 'react-router-dom'
import PercentIcon from '@mui/icons-material/Percent'
import { useClient } from '../../context/ClientContext'
import { useEffect, useState } from 'react'
import { StreamCard } from '../Stream/Card'

export interface StreamChipProps {
    streamID?: string
}

export const StreamChip = (props: StreamChipProps): JSX.Element => {
    const { client } = useClient()
    const [stream, setStream] = useState<Stream<any> | null | undefined>(undefined)

    const domain = props.streamID?.split('@')?.[1]

    useEffect(() => {
        if (stream !== undefined) return
        if (!props.streamID) return
        client.getStream<any>(props.streamID).then(setStream)
    }, [])

    return (
        <Tooltip
            enterDelay={500}
            enterNextDelay={500}
            leaveDelay={300}
            placement="top"
            components={{
                Tooltip: Paper
            }}
            componentsProps={{
                tooltip: {
                    sx: {
                        m: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        minWidth: '300px'
                    }
                }
            }}
            title={
                props.streamID &&
                stream &&
                domain && (
                    <StreamCard
                        streamID={props.streamID}
                        name={stream.payload.name}
                        description={stream.payload.description}
                        banner={stream.payload.banner ?? ''}
                        domain={domain}
                    />
                )
            }
        >
            <Chip
                component={NavLink}
                to={'/stream/' + (props.streamID ?? '')}
                size={'small'}
                label={stream?.payload.name ?? props.streamID}
                icon={<PercentIcon />}
            />
        </Tooltip>
    )
}
