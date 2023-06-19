import { useState, useEffect, useCallback, memo, useContext } from 'react'
import {
    ListItem,
    Box,
    Typography,
    Link,
    IconButton,
    useTheme,
    Tooltip,
    Skeleton,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon
} from '@mui/material'

import type { Character, Message as CCMessage, ProfileWithAddress, StreamElement, Stream, CCID } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import type { Like } from '../../../schemas/like'
import { useApi } from '../../../context/api'
import { useInspector } from '../../../context/Inspector'
import { ApplicationContext } from '../../../App'
import type { ReplyMessage } from '../../../schemas/replyMessage'
import type { ReplyAssociation } from '../../../schemas/replyAssociation'
import { MessageView } from './MessageView'
import { ThinMessageView } from './ThinMessageView'
import { useMessageDetail } from '../../../context/MessageDetail'
import { MessageFrame } from './MessageFrame'

export interface ReRouteMessageFrameProp {
    message: CCMessage<any>
    lastUpdated: number
    thin?: boolean
}

export const ReRouteMessageFrame = memo<ReRouteMessageFrameProp>((props: ReRouteMessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const appContext = useContext(ApplicationContext)
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<CCMessage<any> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)

    const theme = useTheme()

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    const [fetchSuccess, setFetchSucceed] = useState<boolean>(true)

    const [reRouteMessage, setReRouteMessage] = useState<CCMessage<any> | undefined>()

    useEffect(() => {
        setMessage(props.message)

        console.log(props.message)
        api.readCharacter(props.message.author, Schemas.profile).then((e) => {
            setAuthor(e)
        })

        api.fetchMessageWithAuthor(
            props.message.payload.body.rerouteMessageId,
            props.message.payload.body.rerouteMessageAuthor
        ).then((e) => {
            console.log(e)
            setReRouteMessage(e)
        })

        // Promise.all(props.message.streams.map(async (id) => await api.readStream(id))).then((e) => {
        //     setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        // })
        // api.readCharacter(props.message.author, Schemas.profile)
        //     .then((author) => {
        //         setAuthor(author)
        //     })
        //     .catch((error) => {
        //         console.error(error)
        //     })
    }, [props.message, props.lastUpdated])

    return (
        <>
            <Typography>{author?.payload.body.username || 'Anonymous'} さんがReRouteしました</Typography>
            {reRouteMessage && (
                <Box sx={{ ml: 2 }}>
                    <MessageFrame message={reRouteMessage} lastUpdated={0}></MessageFrame>
                </Box>
            )}
        </>
    )
})

ReRouteMessageFrame.displayName = 'ReRouteMessageFrame'
