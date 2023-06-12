import { memo, useEffect, useState } from 'react'
import type { Association, Character, Message, StreamElement } from '../../model'
import { useApi } from '../../context/api'
import { Schemas } from '../../schemas'
import { Box, IconButton, ListItem, Typography } from '@mui/material'
import type { Profile } from '../../schemas/profile'
import { Link as routerLink } from 'react-router-dom'
import { CCAvatar } from '../CCAvatar'

export interface AssociationFrameProp {
    association: StreamElement
    lastUpdated: number
}

export const AssociationFrame = memo<AssociationFrameProp>((props: AssociationFrameProp): JSX.Element => {
    const api = useApi()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [association, setAssociation] = useState<Association<any> | undefined>()

    const isMeToOther = association?.author !== api.userAddress

    useEffect(() => {
        api.fetchAssociation(props.association.id, props.association.currenthost).then((a) => {
            if (!a) return
            setAssociation(a)
            api.fetchMessage(a.targetID, props.association.currenthost).then((m) => {
                setMessage(m)
                if (!m) return
                const isMeToOther = a.author !== api.userAddress
                api.readCharacter(
                    isMeToOther ? props.association.author : m.author,
                    Schemas.profile,
                    props.association.currenthost
                ).then((author) => {
                    setAuthor(author)
                })
            })
        })
    }, [])

    if (!association) {
        return (
            <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                    404 not found
                </Typography>
            </ListItem>
        )
    }

    return (
        <>
            {association.schema === Schemas.like && (
                <ListItem
                    sx={{
                        alignItems: 'flex-start',
                        flex: 1,
                        p: { xs: '7px 0', sm: '10px 0' },
                        wordBreak: 'break-word'
                    }}
                >
                    <Box
                        sx={{
                            padding: {
                                xs: '5px 8px 0 0',
                                sm: '8px 10px 0 0'
                            }
                        }}
                    >
                        <IconButton
                            sx={{
                                width: { xs: '38px', sm: '48px' },
                                height: { xs: '38px', sm: '48px' }
                            }}
                            component={routerLink}
                            to={'/entity/' + association.author}
                        >
                            <CCAvatar
                                alt={author?.payload.body.username}
                                avatarURL={author?.payload.body.avatar}
                                identiconSource={association.author}
                                sx={{
                                    width: { xs: '38px', sm: '48px' },
                                    height: { xs: '38px', sm: '48px' }
                                }}
                            />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            width: '100%',
                            overflow: 'auto'
                        }}
                    >
                        <Typography>
                            {isMeToOther ? (
                                <>
                                    <b>{author?.payload.body.username}</b> favorited your message
                                </>
                            ) : (
                                <>
                                    You favorited <b>{author?.payload.body.username}</b>&apos;s message
                                </>
                            )}
                        </Typography>
                        <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '4px solid #ccc' }}>
                            {message?.payload.body.body}
                        </blockquote>
                    </Box>
                </ListItem>
            )}
        </>
    )
})

AssociationFrame.displayName = 'AssociationFrame'
