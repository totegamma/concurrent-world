import { Box, Button, alpha, useTheme } from '@mui/material'
import { SimpleNote } from './SimpleNote'
import { MessageHeader } from './MessageHeader'
import { MessageActions } from './MessageActions'
import { MessageReactions } from './MessageReactions'
import { MessageUrlPreview } from './MessageUrlPreview'
import {
    type RerouteMessageSchema,
    type Message,
    type ReplyMessageSchema,
    type MarkdownMessageSchema,
    Schemas,
    type CoreProfile
} from '@concurrent-world/client'
import { PostedStreams } from './PostedStreams'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ReplayIcon from '@mui/icons-material/Replay'
import { useEffect, useMemo, useState } from 'react'
import { useClient } from '../../context/ClientContext'

export interface MessageViewProps {
    message: Message<MarkdownMessageSchema | ReplyMessageSchema>
    rerouted?: Message<RerouteMessageSchema>
    userCCID?: string
    beforeMessage?: JSX.Element
    lastUpdated?: number
    forceExpanded?: boolean
    clipHeight?: number
    simple?: boolean
    additionalMenuItems?: JSX.Element | JSX.Element[]
}

const gradationHeight = 80

export const MessageView = (props: MessageViewProps): JSX.Element => {
    const theme = useTheme()
    const clipHeight = props.clipHeight ?? 450
    const [expanded, setExpanded] = useState(props.forceExpanded ?? false)

    const { client } = useClient()

    const [characterOverride, setProfileOverride] = useState<CoreProfile<any> | undefined>(undefined)

    useEffect(() => {
        if (!(client && props.message.document.body.profileOverride?.profileID)) return
        client.api
            .getProfileByID(props.message.document.body.profileOverride?.profileID, props.message.author)
            .then((profile) => {
                setProfileOverride(profile ?? undefined)
            })
    }, [client, props.message])

    const reroutedsame = useMemo(() => {
        if (!props.rerouted) return false
        const A =
            props.rerouted.postedStreams?.filter(
                (stream) => stream.schema === Schemas.communityTimeline || stream.schema === Schemas.emptyTimeline
            ) ?? []
        const B =
            props.message.postedStreams?.filter(
                (stream) => stream.schema === Schemas.communityTimeline || stream.schema === Schemas.emptyTimeline
            ) ?? []
        if (A.length !== B.length) return false
        const Aids = A.map((e) => e.id).sort()
        const Bids = B.map((e) => e.id).sort()
        return Aids.every((v, i) => v === Bids[i])
    }, [props.rerouted, props.message])

    return (
        <ContentWithCCAvatar
            author={props.message.authorUser}
            profileOverride={props.message.document.body.profileOverride}
            avatarOverride={characterOverride?.document.body.avatar}
        >
            <MessageHeader
                usernameOverride={characterOverride?.document.body.username}
                message={props.message}
                additionalMenuItems={props.additionalMenuItems}
                timeLink={props.message.document.meta?.apObjectRef}
            />
            {props.beforeMessage}
            <Box
                sx={{
                    position: 'relative',
                    maxHeight: expanded ? 'none' : `${clipHeight}px`,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: expanded ? 'none' : 'flex',
                        position: 'absolute',
                        top: `${clipHeight - gradationHeight}px`,
                        left: '0',
                        width: '100%',
                        height: `${gradationHeight}px`,
                        background: `linear-gradient(${alpha(theme.palette.background.paper, 0)}, ${
                            theme.palette.background.paper
                        })`,
                        alignItems: 'center',
                        zIndex: 1,
                        justifyContent: 'center'
                    }}
                >
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            setExpanded(true)
                        }}
                    >
                        Show more
                    </Button>
                </Box>
                <SimpleNote message={props.message} />
            </Box>
            {(!props.simple && <MessageUrlPreview limit={1} messageBody={props.message.document.body.body} />) ||
                undefined}
            {(!props.simple && (
                <>
                    <MessageReactions message={props.message} />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                            mt: 1
                        }}
                    >
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <PostedStreams useUserIcon={!!props.rerouted} message={props.message} />
                            {props.rerouted &&
                                (reroutedsame ? (
                                    <ReplayIcon sx={{ color: 'text.secondary', fontSize: '90%' }} />
                                ) : (
                                    <>
                                        <ArrowForwardIcon sx={{ color: 'text.secondary', fontSize: '90%' }} />
                                        <PostedStreams useUserIcon message={props.rerouted} />
                                    </>
                                ))}
                        </Box>
                        <MessageActions message={props.message} userCCID={props.userCCID} />
                    </Box>
                </>
            )) ||
                undefined}
        </ContentWithCCAvatar>
    )
}
