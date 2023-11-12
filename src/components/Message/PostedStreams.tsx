import {
    type Message,
    type ReplyMessageSchema,
    Schemas,
    type SimpleNoteSchema,
    type RerouteMessageSchema
} from '@concurrent-world/client'
import { Box, Link } from '@mui/material'
import { useMemo } from 'react'

import { Link as RouterLink } from 'react-router-dom'

export interface PostedStreamsProps {
    message: Message<SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema>
}

export const PostedStreams = (props: PostedStreamsProps): JSX.Element => {
    const postedCommonStreams = useMemo(
        () => props.message.postedStreams?.filter((stream) => stream.schema === Schemas.commonstream) ?? [],
        [props.message]
    )

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.5,
                ml: 'auto'
            }}
        >
            {postedCommonStreams.map((e) => (
                <Link
                    key={e.id}
                    component={RouterLink}
                    to={'/stream#' + e.id}
                    underline="hover"
                    sx={{
                        fontweight: '400',
                        fontSize: '12px',
                        color: 'text.secondary',
                        borderColor: 'divider'
                    }}
                >
                    %{e.payload.shortname}
                </Link>
            ))}
        </Box>
    )
}
