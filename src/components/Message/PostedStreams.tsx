import {
    type Message,
    type ReplyMessageSchema,
    Schemas,
    type SimpleNoteSchema,
    type RerouteMessageSchema
} from '@concurrent-world/client'
import { Box, Link, Tooltip } from '@mui/material'
import { useMemo } from 'react'

import { Link as RouterLink } from 'react-router-dom'
import { useClient } from '../../context/ClientContext'
import { CCUserIcon } from '../ui/CCUserIcon'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

export interface PostedStreamsProps {
    useUserIcon?: boolean
    message: Message<SimpleNoteSchema | ReplyMessageSchema | RerouteMessageSchema>
}

export const PostedStreams = (props: PostedStreamsProps): JSX.Element => {
    const { client } = useClient()
    const postedStreams = useMemo(() => {
        const streams =
            props.message.postedStreams?.filter(
                (stream) =>
                    (stream.schema === Schemas.commonstream && (stream.author === client.ccid || stream.visible)) ||
                    stream.schema === Schemas.utilitystream
            ) ?? []
        const uniq = [...new Set(streams)]
        return uniq
    }, [props.message])

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
            {postedStreams.length === 0 && (
                <HelpOutlineIcon
                    sx={{
                        height: '1rem',
                        width: '1rem',
                        color: 'text.secondary'
                    }}
                />
            )}
            {postedStreams.map((e) => {
                switch (e.schema) {
                    case Schemas.commonstream:
                        return (
                            <Link
                                key={e.id}
                                component={RouterLink}
                                to={'/stream/' + e.id}
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
                        )
                    case Schemas.utilitystream:
                        return props.useUserIcon ? (
                            <CCUserIcon
                                key={e.id}
                                sx={{
                                    height: '1rem',
                                    width: '1rem'
                                }}
                                ccid={e.author}
                            />
                        ) : (
                            <Tooltip
                                key={e.id}
                                arrow
                                placement="top"
                                title={
                                    <CCUserIcon
                                        sx={{
                                            height: '1rem',
                                            width: '1rem'
                                        }}
                                        ccid={e.author}
                                    />
                                }
                            >
                                <HomeOutlinedIcon
                                    sx={{
                                        height: '1rem',
                                        width: '1rem',
                                        color: 'text.secondary'
                                    }}
                                />
                            </Tooltip>
                        )
                    default:
                        return null
                }
            })}
        </Box>
    )
}
