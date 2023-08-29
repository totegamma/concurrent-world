import type { M_Current, M_Reply } from '@concurrent-world/client'
import { type APIResponse } from '@dhaiwat10/react-link-preview'
import { Box, Paper, Typography } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export interface MessageUrlPreviewProps {
    message: M_Current | M_Reply
}

export const MessageUrlPreview = (props: MessageUrlPreviewProps): JSX.Element | null => {
    const messageBody = props.message.body

    // strip markdown image syntax
    const replaced = messageBody.replace(/!\[.*\]\(.*\)/g, '')

    // extract urls
    const urls = replaced.match(/(https?:\/\/[^\s]+)/g)

    if (!urls) return null

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                p: 1
            }}
        >
            {urls.map((url, i) => {
                return <UrlPreview key={i} url={url} />
            })}
        </Box>
    )
}

export const UrlPreview = (props: { url: string }): JSX.Element | null => {
    const pref = usePreference()
    const [preview, setPreview] = useState<APIResponse | null>(null)

    useEffect(() => {
        const fetchPreview = async (): Promise<void> => {
            const response = await fetch(`${pref.mediaProxy}v2?url=${props.url}`)
            const json = await response.json()
            setPreview(json.metadata)
        }
        fetchPreview()
    }, [props.url])

    if (!preview?.title) return null

    return (
        <Paper
            variant="outlined"
            sx={{
                display: 'flex',
                height: '100px',
                overflow: 'hidden',
                textDecoration: 'none'
            }}
            component={RouterLink}
            to={props.url}
            target="_blank"
            rel="noopener noreferrer"
        >
            <Box
                component="img"
                sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover'
                }}
                src={preview?.image ?? ''}
                alt={preview?.title ?? ''}
            />
            <Box padding={1} height="100px" overflow="hidden">
                <Typography variant="h3" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" width="100%">
                    {preview?.title ?? ''}
                </Typography>

                <Typography variant="body2" width="100%" height="40px" textOverflow="ellipsis" overflow="hidden">
                    {preview?.description ?? ''}
                </Typography>

                <Typography
                    variant="caption"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    width="100%"
                >
                    {props.url ?? ''}
                </Typography>
            </Box>
        </Paper>
    )
}
