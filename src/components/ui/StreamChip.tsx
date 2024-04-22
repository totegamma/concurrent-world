import { Tooltip, Paper, Chip } from '@mui/material'
import { type Timeline } from '@concurrent-world/client'
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
    const [stream, setStream] = useState<Timeline<any> | null | undefined>(undefined)

    const domain = props.streamID?.split('@')?.[1]

    useEffect(() => {
        if (stream !== undefined) return
        if (!props.streamID) return
        client.getTimeline<any>(props.streamID).then(setStream)
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
                        name={stream.document.body.name}
                        description={stream.document.body.description}
                        banner={stream.document.body.banner ?? ''}
                        domain={domain}
                    />
                )
            }
        >
            <Chip
                component={NavLink}
                to={'/stream/' + (props.streamID ?? '')}
                size={'small'}
                label={stream?.document.body.name ?? props.streamID}
                icon={<PercentIcon />}
            />
        </Tooltip>
    )
}
