import { memo, useEffect, useState } from 'react'
import {
    type CoreStreamElement,
    Schemas,
    type A_Unknown,
    type A_Reroute,
    type A_Reply,
    type A_Reaction,
    type A_Favorite,
    type User,
    type M_Current
} from '@concurrent-world/client'
import { useApi } from '../../context/api'
import { Box, IconButton, ListItem, ListItemButton, Typography } from '@mui/material'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../CCAvatar'
import { MessageSkeleton } from '../MessageSkeleton'
import { MessageContainer } from './MessageContainer'

export interface AssociationFrameProp {
    association: CoreStreamElement
    lastUpdated: number
    after: JSX.Element | undefined
    perspective?: string
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element | null => {
    const client = useApi()
    const [association, setAssociation] = useState<A_Favorite | A_Reaction | A_Reply | A_Reroute | A_Unknown | null>(
        null
    )
    const [fetching, setFetching] = useState<boolean>(true)

    const perspective = props.perspective ?? client.ccid
    const isMeToOther = association?.author.ccaddr !== perspective

    const Nominative = perspective === client.ccid ? 'You' : association?.author.profile.username ?? 'anonymous'
    const Possessive =
        perspective === client.ccid ? 'your' : (association?.target.author.profile.username ?? 'anonymous') + "'s"

    const actionUser: User | undefined = isMeToOther ? association?.author : association?.target.author

    useEffect(() => {
        console.log(props.association)
        client
            .getAssociation(props.association.id, props.association.author)
            .then((a) => {
                setAssociation(a)
            })
            .catch((e) => {
                console.warn(e)
            })
            .finally(() => {
                setFetching(false)
            })
    }, [props.association, props.lastUpdated])

    if (fetching) return <MessageSkeleton />
    if (!association)
        return (
            <ListItem>
                <Typography>failed to load {props.association.id}</Typography>
            </ListItem>
        ) // TODO: あとで消す

    switch (association.schema) {
        case Schemas.like:
            return (
                <>
                    <ListItem
                        sx={{
                            alignItems: 'flex-start',
                            wordBreak: 'break-word'
                        }}
                        disablePadding
                    >
                        <ListItemButton
                            disableGutters
                            component={routerLink}
                            to={`/message/${association.target.id ?? ''}@${association.target.author.ccaddr ?? ''}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flex: 1,
                                gap: 2
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' },
                                    mt: { xs: '3px', sm: '5px' }
                                }}
                                component={routerLink}
                                to={'/entity/' + (association.author.ccaddr ?? '')}
                            >
                                <CCAvatar
                                    avatarURL={actionUser?.profile.avatar}
                                    identiconSource={actionUser?.ccaddr ?? ''}
                                    sx={{
                                        width: { xs: '38px', sm: '48px' },
                                        height: { xs: '38px', sm: '48px' }
                                    }}
                                />
                            </IconButton>
                            <Box
                                sx={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    width: '100%',
                                    overflow: 'auto',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{association.author.profile.username ?? 'anonymous'}</b> favorited{' '}
                                            {Possessive} message
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} favorited{' '}
                                            <b>{association.target.author.profile.username ?? 'anonymous'}</b>&apos;s
                                            message
                                        </>
                                    )}
                                </Typography>
                                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                    {(association.target as M_Current)?.body}
                                </blockquote>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                    {props.after}
                </>
            )
        case Schemas.emojiAssociation:
            return (
                <>
                    <ListItem
                        sx={{
                            alignItems: 'flex-start',
                            wordBreak: 'break-word'
                        }}
                        disablePadding
                    >
                        <ListItemButton
                            disableGutters
                            component={routerLink}
                            to={`/message/${association.target.id ?? ''}@${association.target.author.ccaddr ?? ''}`}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flex: 1,
                                gap: 2
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' },
                                    mt: { xs: '3px', sm: '5px' }
                                }}
                                component={routerLink}
                                to={'/entity/' + (association.author.ccaddr ?? '')}
                            >
                                <CCAvatar
                                    avatarURL={actionUser?.profile.avatar}
                                    identiconSource={actionUser?.ccaddr ?? ''}
                                    sx={{
                                        width: { xs: '38px', sm: '48px' },
                                        height: { xs: '38px', sm: '48px' }
                                    }}
                                />
                            </IconButton>
                            <Box
                                sx={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    width: '100%',
                                    overflow: 'auto',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Typography>
                                    {isMeToOther ? (
                                        <>
                                            <b>{association.author.profile.username ?? 'anonymous'}</b> reacted{' '}
                                            {Possessive} message with{' '}
                                            <img
                                                height="13px"
                                                src={(association as A_Reaction).imageUrl}
                                                alt={(association as A_Reaction).shortcode}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {Nominative} reacted{' '}
                                            <b>{association.target.author.profile.username ?? 'anonymous'}</b>&apos;s
                                            message with{' '}
                                            <img
                                                height="13px"
                                                src={(association as A_Reaction).imageUrl}
                                                alt={(association as A_Reaction).shortcode}
                                            />
                                        </>
                                    )}
                                </Typography>
                                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                                    {(association.target as M_Current).body}
                                </blockquote>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                    {props.after}
                </>
            )
        case Schemas.replyAssociation:
            return (
                <MessageContainer
                    messageID={(association as A_Reply).replyBody.id}
                    messageOwner={(association as A_Reply).replyBody.author.ccaddr}
                    after={props.after}
                />
            )
        case Schemas.rerouteAssociation:
            console.log('reroute', association)
            return (
                <MessageContainer
                    messageID={(association as A_Reroute).rerouteBody.id}
                    messageOwner={(association as A_Reroute).rerouteBody.author.ccaddr}
                    after={props.after}
                />
            )
        default:
            return (
                <>
                    <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.disabled">
                            Unknown association schema
                        </Typography>
                    </ListItem>
                    {props.after}
                </>
            )
    }
})

AssociationFrame.displayName = 'AssociationFrame'
