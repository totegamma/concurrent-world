import { Box, IconButton, Link, type Theme, Tooltip, Typography } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { CCAvatar } from '../../CCAvatar'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import React from 'react'
import type { Stream, Message as CCMessage, ProfileWithAddress } from '../../../model'
import type ConcurrentApiClient from '../../../apiservice'
import { Schemas } from '../../../schemas'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
export interface MessageActionsProps {
    handleReply: () => Promise<void>
    reactUsers: ProfileWithAddress[]
    theme: Theme
    hasOwnReaction: boolean
    unfavorite: () => void
    api: ConcurrentApiClient
    message: CCMessage<TypeSimpleNote>
    favorite: () => Promise<void>
    setMessageAnchor: (anchor: null | HTMLElement) => void
    msgstreams: Array<Stream<any>>
}

export const MessageActions = (props: MessageActionsProps): JSX.Element => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between'
            }}
        >
            <Box sx={{ display: 'flex', gap: '20px' }}>
                {/* left */}
                <IconButton
                    sx={{
                        p: '0',
                        color: props.theme.palette.text.secondary
                    }}
                    onClick={() => {
                        props.handleReply()
                    }}
                >
                    <ReplyIcon />
                </IconButton>
                <Tooltip
                    title={
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            {props.reactUsers.map((user) => (
                                <Box
                                    key={user.ccaddress}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                >
                                    <CCAvatar
                                        sx={{
                                            height: '20px',
                                            width: '20px'
                                        }}
                                        avatarURL={user.avatar}
                                        identiconSource={user.ccaddress}
                                        alt={user.ccaddress}
                                    />
                                    {user.username ?? 'anonymous'}
                                </Box>
                            ))}
                        </Box>
                    }
                    placement="top"
                    disableHoverListener={props.reactUsers.length === 0}
                >
                    <Box sx={{ display: 'flex' }}>
                        <IconButton
                            sx={{
                                p: '0',
                                color: props.theme.palette.text.secondary
                            }}
                            color="primary"
                            onClick={() => {
                                if (props.hasOwnReaction) {
                                    props.unfavorite()
                                } else {
                                    props.favorite()
                                }
                            }}
                        >
                            {props.hasOwnReaction ? <StarIcon /> : <StarOutlineIcon />}
                        </IconButton>
                        <Typography sx={{ size: '16px' }}>
                            {props.message.associations.filter((e) => e.schema === Schemas.like).length}
                        </Typography>
                    </Box>
                </Tooltip>
                <IconButton
                    sx={{
                        p: '0',
                        color: props.theme.palette.text.secondary
                    }}
                    onClick={(e) => {
                        props.setMessageAnchor(e.currentTarget)
                    }}
                >
                    <MoreHorizIcon />
                </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: '3px' }}>
                {/* right */}
                {props.msgstreams.map((e) => (
                    <Link
                        key={e.id}
                        underline="hover"
                        sx={{
                            fontweight: '400',
                            fontSize: '13px',
                            color: 'text.secondary'
                        }}
                        href={'/#' + e.id}
                    >
                        {`%${
                            e.payload.body.name.length < 12
                                ? (e.payload.body.name as string)
                                : (e.payload.body.name.slice(0, 9) as string) + '...'
                        }`}
                    </Link>
                ))}
            </Box>
        </Box>
    )
}
