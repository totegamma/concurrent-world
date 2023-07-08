import { useState, useEffect } from 'react'
import type { Character, Message as CCMessage, ProfileWithAddress, Stream } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { MessageView } from './MessageView'
import { ThinMessageView } from './ThinMessageView'
import { OneLineMessageView } from './OneLineMessageView'
import { MessageSkeleton } from '../../MessageSkeleton'

export interface MessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated: number
    variant?: 'default' | 'thin' | 'oneline'
}

export const MessageFrame = (props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [emojiUsers, setEmojiUsers] = useState<ProfileWithAddress[]>([])

    const [hasOwnReaction, setHasOwnReaction] = useState<boolean>(false)

    useEffect(() => {
        Promise.all(props.message.streams.map(async (id) => await api.readStream(id))).then((e) => {
            setStreams(e.filter((x) => x?.payload.body.name) as Array<Stream<any>>)
        })
        api.readCharacter(props.message.author, Schemas.profile)
            .then((author) => {
                setAuthor(author)
            })
            .catch((error) => {
                console.error(error)
            })
    }, [props.message, props.lastUpdated])

    useEffect(() => {
        // TODO: まとめてfetchする
        const fetchEmojiUsers = async (): Promise<any> => {
            const authors =
                props.message?.associations.filter((e) => e.schema === Schemas.emojiAssociation).map((m) => m.author) ??
                []

            const users = await Promise.all(
                authors.map((ccaddress) =>
                    api.readCharacter(ccaddress, Schemas.profile).then((e) => {
                        return {
                            ccaddress,
                            ...e?.payload.body
                        }
                    })
                )
            )
            setEmojiUsers(users)
        }

        const fetchUsers = async (): Promise<any> => {
            const authors =
                props.message?.associations.filter((e) => e.schema === Schemas.like).map((m) => m.author) ?? []

            if (
                props.message?.associations
                    .filter((a) => a.schema === Schemas.like)
                    .find((e) => e.author === api.userAddress) != null
            ) {
                setHasOwnReaction(true)
            } else {
                setHasOwnReaction(false)
            }
            const users = await Promise.all(
                authors.map((ccaddress) =>
                    api.readCharacter(ccaddress, Schemas.profile).then((e) => {
                        return {
                            ccaddress,
                            ...e?.payload.body
                        }
                    })
                )
            )
            setReactUsers(users)
        }

        fetchUsers()
        fetchEmojiUsers()
    }, [props.message?.associations])

    if (!props.message?.payload?.body) return <MessageSkeleton />

    switch (props.variant) {
        case 'thin':
            return (
                <ThinMessageView
                    message={props.message}
                    userCCID={api.userAddress}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                />
            )
        case 'oneline':
            return (
                <OneLineMessageView
                    message={props.message}
                    userCCID={api.userAddress}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                />
            )

        default:
            return (
                <MessageView
                    message={props.message}
                    userCCID={api.userAddress}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                />
            )
    }
}
