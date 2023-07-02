import { Box, IconButton, Link, type Theme, Tooltip, Typography } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { CCAvatar } from '../../CCAvatar'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import AddReactionIcon from '@mui/icons-material/AddReaction'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RepeatIcon from '@mui/icons-material/Repeat'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import type { Stream, Message as CCMessage, ProfileWithAddress } from '../../../model'
import type ConcurrentApiClient from '../../../apiservice'
import { Schemas } from '../../../schemas'
import type { SimpleNote as TypeSimpleNote } from '../../../schemas/simpleNote'
import { useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Fade from '@mui/material/Fade'
export interface MessageActionsProps {
    handleReply: () => Promise<void>
    handleReRoute: () => Promise<void>
    reactUsers: ProfileWithAddress[]
    theme: Theme
    hasOwnReaction: boolean
    unfavorite: () => void
    api: ConcurrentApiClient
    message: CCMessage<TypeSimpleNote>
    favorite: () => Promise<void>
    setMessageAnchor: (anchor: null | HTMLElement) => void
    setEmojiPickerAnchor: (anchor: null | HTMLElement) => void
    msgstreams: Array<Stream<any>>
}

export const MessageActions = (props: MessageActionsProps): JSX.Element => {
    const [streamListOpen, setStreamListOpen] = useState<boolean>(false)

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '1.5rem',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: { xs: 3, sm: 4 }
                    }}
                >
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
                        <ReplyIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <IconButton
                        sx={{
                            p: '0',
                            color: props.theme.palette.text.secondary
                        }}
                        onClick={() => {
                            props.handleReRoute()
                        }}
                    >
                        <RepeatIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <Tooltip
                        arrow
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
                                {props.hasOwnReaction ? (
                                    <StarIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                ) : (
                                    <StarOutlineIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                                )}
                            </IconButton>
                            <Typography sx={{ m: 'auto', size: '16px', fontSize: '13px' }}>
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
                            props.setEmojiPickerAnchor(e.currentTarget)
                        }}
                    >
                        <AddReactionIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                    <IconButton
                        sx={{
                            p: '0',
                            color: props.theme.palette.text.secondary
                        }}
                        onClick={(e) => {
                            props.setMessageAnchor(e.currentTarget)
                        }}
                    >
                        <MoreHorizIcon sx={{ fontSize: { xs: '70%', sm: '80%' } }} />
                    </IconButton>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {props.msgstreams.map((e) => (
                        <Link
                            key={e.id}
                            underline="hover"
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            href={'/#' + e.id}
                        >
                            {`%${e.payload.body.shortname as string}`}
                        </Link>
                    ))}
                </Box>
                <Fade in={!streamListOpen}>
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, ml: 'auto', overFlow: 'hidden' }}>
                        {props.msgstreams[0] && (
                            <Link
                                underline="hover"
                                sx={{
                                    fontweight: '400',
                                    fontSize: '12px',
                                    color: 'text.secondary'
                                }}
                                href={'/#' + props.msgstreams[0].id}
                            >
                                {`%${props.msgstreams[0].payload.body.shortname as string}`}
                            </Link>
                        )}
                    </Box>
                </Fade>
                <Fade in={streamListOpen} unmountOnExit>
                    <Box>
                        <IconButton
                            onClick={() => {
                                setStreamListOpen(false)
                            }}
                            sx={{
                                p: '0',
                                color: props.theme.palette.text.secondary
                            }}
                        >
                            <ExpandCircleDownIcon
                                sx={{ fontSize: { transform: 'rotate(180deg)', xs: '70%', sm: '80%' } }}
                            />
                        </IconButton>
                    </Box>
                </Fade>
                {streamListOpen || (
                    <Box sx={{ display: { xs: 'block', sm: 'none', whiteSpace: 'nowrap' } }}>
                        {props.msgstreams.length > 1 && (
                            <Link
                                onClick={() => {
                                    setStreamListOpen(true)
                                }}
                                underline="hover"
                                sx={{
                                    fontweight: '400',
                                    fontSize: '12px',
                                    color: 'text.secondary'
                                }}
                            >
                                +{props.msgstreams.length - 1}
                            </Link>
                        )}
                    </Box>
                )}
            </Box>
            <Collapse in={streamListOpen} collapsedSize={0}>
                <Box
                    sx={{
                        display: { xs: 'flex', sm: 'none' },
                        gap: 1
                    }}
                >
                    {props.msgstreams.map((e) => (
                        <Link
                            key={e.id}
                            underline="hover"
                            sx={{
                                fontweight: '400',
                                fontSize: '12px',
                                color: 'text.secondary'
                            }}
                            href={'/#' + e.id}
                        >
                            {`%${e.payload.body.shortname as string}`}
                        </Link>
                    ))}
                </Box>
            </Collapse>
        </>
    )
}
