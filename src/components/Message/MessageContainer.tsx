import {
    type Message,
    type ReplyMessageSchema,
    type RerouteMessageSchema,
    Schemas,
    type MarkdownMessageSchema
} from '@concurrent-world/client'
import { useClient } from '../../context/ClientContext'
import { memo, useEffect, useState } from 'react'
import { ReplyMessageFrame } from './ReplyMessageFrame'
import { RerouteMessageFrame } from './RerouteMessageFrame'
import { MessageSkeleton } from '../MessageSkeleton'
import { Box, type SxProps, Typography, Button } from '@mui/material'
import { MessageView } from './MessageView'
import { usePreference } from '../../context/PreferenceContext'
import { ContentWithUserFetch } from '../ContentWithUserFetch'

import SearchOffIcon from '@mui/icons-material/SearchOff'
import TerminalIcon from '@mui/icons-material/Terminal'
import { CopyChip } from '../ui/CopyChip'

interface MessageContainerProps {
    messageID: string
    messageOwner: string
    resolveHint?: string
    lastUpdated?: number
    after?: JSX.Element | undefined
    timestamp?: Date
    rerouted?: Message<RerouteMessageSchema>
    simple?: boolean
    sx?: SxProps
}

export const MessageContainer = memo<MessageContainerProps>((props: MessageContainerProps): JSX.Element | null => {
    const { client } = useClient()
    const [message, setMessage] = useState<Message<
        MarkdownMessageSchema | ReplyMessageSchema | RerouteMessageSchema
    > | null>()
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [devMode] = usePreference('devMode')
    const [forceUpdateCount, setForceUpdateCount] = useState<number>(0)

    useEffect(() => {
        console.log('fetching message', props.messageID)
        client
            .getMessage<any>(props.messageID, props.messageOwner, props.resolveHint)
            .then((msg) => {
                setMessage(msg)
            })
            .finally(() => {
                setIsFetching(false)
            })
    }, [props.messageID, props.messageOwner, props.lastUpdated, forceUpdateCount])

    if (isFetching) {
        return (
            <>
                <Box sx={props.sx}>
                    <MessageSkeleton />
                </Box>
                {props.after}
            </>
        )
    }

    if (!message) {
        if (devMode) {
            return (
                <>
                    <Box
                        sx={{
                            ...props.sx,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <ContentWithUserFetch
                            ccid={props.messageOwner}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1
                            }}
                        >
                            <Box display="flex" flexDirection="row" justifyContent="space-between" gap={1} width="100%">
                                <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                                    <SearchOffIcon />
                                    <Typography variant="caption">Failed to fetch message.</Typography>
                                </Box>
                                <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                                    <TerminalIcon />
                                    <Typography variant="caption">開発者ビュー</Typography>
                                </Box>
                            </Box>
                            <Box display="flex" flexDirection="row" justifyContent="center" gap={1} width="100%">
                                <Box display="flex" flexWrap="wrap" gap={1} flex={1}>
                                    <CopyChip label={`ID: ${props.messageID}`} content={props.messageID} />
                                    <CopyChip label={`Owner: ${props.messageOwner}`} content={props.messageOwner} />
                                    {props.resolveHint && (
                                        <CopyChip
                                            label={`ResolveHint: ${props.resolveHint}`}
                                            content={props.resolveHint}
                                        />
                                    )}
                                </Box>
                                <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            client.invalidateMessage(props.messageID)
                                            setForceUpdateCount((prev) => prev + 1)
                                        }}
                                    >
                                        Reload
                                    </Button>
                                </Box>
                            </Box>
                        </ContentWithUserFetch>
                    </Box>
                    {props.after}
                </>
            )
        }
        return <></>
    }

    let body
    switch (message?.schema) {
        case Schemas.markdownMessage:
            body = (
                <Box sx={props.sx}>
                    <MessageView
                        simple={props.simple}
                        message={message as Message<MarkdownMessageSchema>}
                        lastUpdated={props.lastUpdated}
                        userCCID={client.ccid}
                        rerouted={props.rerouted}
                    />
                </Box>
            )
            break
        case Schemas.replyMessage:
            body = (
                <Box sx={props.sx}>
                    <ReplyMessageFrame
                        simple={props.simple}
                        message={message as Message<ReplyMessageSchema>}
                        lastUpdated={props.lastUpdated}
                        userCCID={client.ccid}
                        rerouted={props.rerouted}
                    />
                </Box>
            )
            break
        case Schemas.rerouteMessage:
            body = (
                <Box sx={props.sx}>
                    <RerouteMessageFrame
                        simple={props.simple}
                        message={message as Message<RerouteMessageSchema>}
                        lastUpdated={props.lastUpdated}
                    />
                </Box>
            )
            break
        default:
            body = <Typography>unknown schema: {(message as any).schema}</Typography>
            break
    }

    return (
        <>
            {body}
            {props.after}
        </>
    )
})

MessageContainer.displayName = 'MessageContainer'
