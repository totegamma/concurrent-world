import { useState, useEffect, useCallback } from 'react'

import type { Character, Message as CCMessage, ProfileWithAddress, Stream, CCID } from '../../../model'
import type { Profile } from '../../../schemas/profile'
import { Schemas } from '../../../schemas'
import { useApi } from '../../../context/api'
import { useInspector } from '../../../context/Inspector'
import { MessageView } from './MessageView'
import { ThinMessageView } from './ThinMessageView'
import { OneLineMessageView } from './OneLineMessageView'
import { useMessageDetail } from '../../../context/MessageDetail'
import { MessageSkeleton } from '../../MessageSkeleton'

export interface MessageFrameProp {
    message: CCMessage<any>
    reloadMessage: () => void
    lastUpdated: number
    variant?: 'default' | 'thin' | 'oneline'
}

export const MessageFrame = (props: MessageFrameProp): JSX.Element => {
    const api = useApi()
    const inspector = useInspector()
    const messageDetail = useMessageDetail()
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [msgStreams, setStreams] = useState<Array<Stream<any>>>([])
    const [reactUsers, setReactUsers] = useState<ProfileWithAddress[]>([])
    const [messageAnchor, setMessageAnchor] = useState<null | HTMLElement>(null)
    const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<null | HTMLElement>(null)
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

    const unfavorite = useCallback(async (deletekey: string | undefined, author: CCID): Promise<void> => {
        if (!deletekey) return
        await api.unFavoriteMessage(deletekey, author)
        // 後々消す
        props.reloadMessage()
    }, [])

    const deleteMessage = useCallback(
        (deletekey: string): void => {
            api.deleteMessage(deletekey).then(() => {
                api.invalidateMessage(deletekey)
                props.reloadMessage()
            })
            setMessageAnchor(null)
        },
        [api]
    )

    if (!props.message?.payload?.body) return <MessageSkeleton />

    switch (props.variant) {
        case 'thin':
            return (
                <ThinMessageView
                    message={props.message}
                    author={author}
                    reactUsers={reactUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    inspectHandler={() => {}}
                    handleReply={async () => {}}
                    unfavorite={() => {}}
                    favorite={async () => {}}
                    setMessageAnchor={setMessageAnchor}
                />
            )
        case 'oneline':
            return (
                <OneLineMessageView
                    message={props.message}
                    author={author}
                    reactUsers={reactUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    messageAnchor={messageAnchor}
                    inspectHandler={() => {}}
                    handleReply={async () => {}}
                    unfavorite={() => {}}
                    favorite={async () => {}}
                    setMessageAnchor={setMessageAnchor}
                />
            )

        default:
            return (
                <MessageView
                    userCCID={api.userAddress}
                    message={props.message}
                    author={author}
                    reactUsers={reactUsers}
                    emojiUsers={emojiUsers}
                    hasOwnReaction={hasOwnReaction}
                    msgstreams={msgStreams}
                    emojiPickerAnchor={emojiPickerAnchor}
                    messageAnchor={messageAnchor}
                    inspectHandler={() => {
                        inspector.inspectItem({ messageId: props.message.id, author: props.message.author })
                    }}
                    handleReply={async () => {
                        messageDetail.openAction('reply', props.message?.id || '', props.message?.author || '')
                    }}
                    handleReRoute={async () => {
                        messageDetail.openAction('reroute', props.message.id, props.message?.author)
                    }}
                    unfavorite={() => {
                        unfavorite(
                            props.message.associations.find(
                                (e) => e.author === api.userAddress && e.schema === Schemas.like
                            )?.id,
                            props.message.author
                        )
                    }}
                    favorite={async () => {
                        await api.favoriteMessage(props.message.id, props.message.author)
                        // 後々消す
                        props.reloadMessage()
                    }}
                    addMessageReaction={async (emoji) => {
                        await api.addMessageReaction(
                            props.message.id,
                            props.message.author,
                            emoji.shortcodes,
                            emoji.src
                        )
                        // 後々消す
                        props.reloadMessage()
                    }}
                    removeMessageReaction={async (id: string) => {
                        await api.unFavoriteMessage(id, props.message.author)
                        // 後々消す
                        props.reloadMessage()
                    }}
                    setMessageAnchor={setMessageAnchor}
                    setEmojiPickerAnchor={setEmojiPickerAnchor}
                    deleteMessage={deleteMessage}
                />
            )
    }
}
