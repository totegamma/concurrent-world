import {
    type Association,
    type ReactionAssociationSchema,
    type Message,
    type ReplyMessageSchema,
    type MarkdownMessageSchema,
    type User
} from '@concurrent-world/client'
import { ContentWithCCAvatar } from '../ContentWithCCAvatar'
import { Box, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material'
import { TimeDiff } from '../ui/TimeDiff'
import { Link as RouterLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MarkdownRendererLite } from '../ui/MarkdownRendererLite'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useClient } from '../../context/ClientContext'

export interface ReactionAssociationProps {
    association: Association<ReactionAssociationSchema>
    perspective?: string
    withoutContent?: boolean
}

export const ReactionAssociation = (props: ReactionAssociationProps): JSX.Element => {
    const { client } = useClient()
    const [target, setTarget] = useState<Message<MarkdownMessageSchema | ReplyMessageSchema> | null>(null)
    const isMeToOther = props.association?.authorUser?.ccid !== props.perspective

    const Nominative = props.association?.authorUser?.profile?.username ?? 'anonymous'
    const Possessive =
        (target?.document.body.profileOverride?.username ?? target?.authorUser?.profile?.username ?? 'anonymous') + "'s"

    const actionUser: User | undefined = isMeToOther ? props.association.authorUser : target?.authorUser
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

    useEffect(() => {
        props.association.getTargetMessage().then(setTarget)
    }, [props.association])

    return (
        <ContentWithCCAvatar
            author={actionUser}
            profileOverride={!isMeToOther ? target?.document.body.profileOverride : undefined}
        >
            <Box display="flex" justifyContent="space-between">
                <Typography>
                    {isMeToOther ? (
                        <>
                            <b>{Nominative}</b> reacted {Possessive} message with{' '}
                            <img
                                height="13px"
                                src={props.association.document.body.imageUrl}
                                alt={props.association.document.body.shortcode}
                            />
                        </>
                    ) : (
                        <>
                            {Nominative} reacted <b>{Possessive}</b> message with{' '}
                            <img
                                height="13px"
                                src={props.association.document.body.imageUrl}
                                alt={props.association.document.body.shortcode}
                            />
                        </>
                    )}
                </Typography>
                <Box>
                    {(props.association.author === client?.ccid || props.association.owner === client?.ccid) && (
                        <IconButton
                            sx={{
                                width: { xs: '12px', sm: '18px' },
                                height: { xs: '12px', sm: '18px' },
                                color: 'text.disabled'
                            }}
                            onClick={(e) => {
                                setMenuAnchor(e.currentTarget)
                            }}
                        >
                            <MoreHorizIcon sx={{ fontSize: '80%' }} />
                        </IconButton>
                    )}
                    <Link
                        component={RouterLink}
                        underline="hover"
                        color="inherit"
                        fontSize="0.75rem"
                        to={`/${target?.author ?? ''}/${target?.id ?? ''}`}
                    >
                        <TimeDiff date={new Date(props.association.cdate)} />
                    </Link>
                </Box>
            </Box>
            {(!props.withoutContent && (
                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                    <MarkdownRendererLite
                        messagebody={target?.document.body.body ?? 'no content'}
                        emojiDict={target?.document.body.emojis ?? {}}
                    />
                </blockquote>
            )) ||
                undefined}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => {
                    setMenuAnchor(null)
                }}
            >
                <MenuItem
                    onClick={() => {
                        props.association.delete()
                        setMenuAnchor(null)
                    }}
                >
                    <ListItemIcon>
                        <DeleteForeverIcon sx={{ color: 'text.primary' }} />
                    </ListItemIcon>
                    <ListItemText>関連付けを削除</ListItemText>
                </MenuItem>
            </Menu>
        </ContentWithCCAvatar>
    )
}
