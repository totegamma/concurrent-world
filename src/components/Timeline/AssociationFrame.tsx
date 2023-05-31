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

    useEffect(() => {
        api.fetchAssociation(props.association.id, props.association.currenthost).then((a) => {
            if (!a) return
            setAssociation(a)
            api.fetchMessage(a.targetID, props.association.currenthost).then((m) => {
                setMessage(m)
            })
        })
        api.readCharacter(props.association.author, Schemas.profile, props.association.currenthost).then((author) => {
            setAuthor(author)
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
                <ListItem sx={{ display: 'flex', gap: '15px' }}>
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
                    <Box sx={{ display: 'flex', flexFlow: 'column' }}>
                        <Typography>
                            <b>{author?.payload.body.username}</b> favorites
                        </Typography>
                        <Typography>{message?.payload.body.body}</Typography>
                    </Box>
                </ListItem>
            )}
        </>
    )
})

AssociationFrame.displayName = 'AssociationFrame'
