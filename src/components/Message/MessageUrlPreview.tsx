import { Box, Paper, Skeleton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useApi } from '../../context/api'
import { fetchWithTimeout } from '@concurrent-world/client'
// import { usePreference } from '../../context/PreferenceContext'

export interface MessageUrlPreviewProps {
    messageBody: string
}

export const MessageUrlPreview = (props: MessageUrlPreviewProps): JSX.Element | null => {
    // strip markdown image syntax
    let replaced = props.messageBody.replace(/!\[.*\]\(.*\)/g, '')

    // strip codeblock
    replaced = replaced.replace(/```[\s\S]*?```/g, '')

    // replace markdown link syntax
    replaced = replaced.replace(/\[(.*)\]\((.*)\)/g, '$2')

    // extract urls
    const urls = replaced.match(/(https?:\/\/[^\s]+)/g)

    if (!urls) return null

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                py: 1
            }}
        >
            {urls.map((url, i) => {
                return <UrlPreview key={i} url={url} />
            })}
        </Box>
    )
}

interface Summary {
    title: string
    icon: string
    description: string
    thumbnail: string
    sitename: string
    url: string
}

export const UrlPreview = (props: { url: string }): JSX.Element | null => {
    // const pref = usePreference()
    const client = useApi()
    const [preview, setPreview] = useState<Summary | null>(null)
    const [errored, setErrored] = useState(false)

    useEffect(() => {
        const fetchPreview = async (): Promise<void> => {
            const response = await fetchWithTimeout(client.host, `/summary?url=${props.url}`, {}).catch(() => {
                setErrored(true)
            })
            if (!response || errored) return
            const json = await response.json()
            setPreview(json)
        }
        fetchPreview()
    }, [props.url])

    if (errored) return null

    if (!preview?.title) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    display: 'flex',
                    height: '100px',
                    width: '100%',
                    overflow: 'hidden',
                    textDecoration: 'none'
                }}
            >
                <Skeleton variant="rectangular" width="100px" height={100} />
                <Box padding={1} height="100px" flex={1}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="40%" />
                </Box>
            </Paper>
        )
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                display: 'flex',
                height: '100px',
                width: '100%',
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
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover'
                }}
                src={preview?.thumbnail || preview?.icon || ''}
                alt={preview?.title ?? ''}
            />
            <Box padding={1} height="100px" overflow="hidden">
                <Typography variant="h3" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" width="100%">
                    {preview?.title ?? 'No Title'}
                </Typography>

                <Typography variant="body2" width="100%" height="40px" textOverflow="ellipsis" overflow="hidden">
                    {preview?.description ?? '説明はありません'}
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
