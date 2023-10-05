import { Schemas, type CoreMessage, validateSignature, M_Current, M_Reply, M_Reroute } from '@concurrent-world/client'
import { Paper } from '@mui/material'
import { memo, useCallback, useEffect, useState } from 'react'
import { MessageContainer } from './MessageContainer'
import { useApi } from '../../context/api'

interface ReplyTreeMessageProps {
    messageID: string
    messageOwner: string
    isBackward: boolean
}

/*
    Messageページ内のリプライツリーを表示するコンポーネント
*/
export const ReplyTreeMessage = (props: ReplyTreeMessageProps): JSX.Element => {
    const client = useApi()
    // const [message, setMessage] = useState<CoreMessage<any> | undefined>()
    // const [treeMessageIdentities, setTreeMessageIdentities] = useState<Array<{messageID: string, messageOwner: string}>>(new Array())
    let message: CoreMessage<any> | undefined
    let treeMessageIdentities: Array<{ messageID: string; messageOwner: string }> = []

    useEffect(() => {
        client.api.readMessageWithAuthor(props.messageID, props.messageOwner).then((msg: CoreMessage<any>) => {
            if (msg)
                // setMessage(msg)
                message = msg
        })

        if (props.isBackward && message?.payload.body.replyToMessageId) {
            // setTreeMessageIdentities([...treeMessageIdentities, {messageID: message.payload.body.replyToMessageId, messageOwner: message.payload.body.replyToMessageAuthor}])
            treeMessageIdentities = [
                ...treeMessageIdentities,
                {
                    messageID: message.payload.body.replyToMessageId,
                    messageOwner: message.payload.body.replyToMessageAuthor
                }
            ]
        } else if (!props.isBackward && message?.associations) {
            message.associations.map((a) => {
                if (a.schema === Schemas.replyAssociation) {
                    // setTreeMessageIdentities([...treeMessageIdentities, {messageID: a.payload.body.messageId, messageOwner: a.payload.body.messageAuthor}])
                    treeMessageIdentities = [
                        ...treeMessageIdentities,
                        { messageID: a.payload.body.messageId, messageOwner: a.payload.body.messageAuthor }
                    ]
                }
                return 0
            })
        }
    }, [props.messageID, props.messageOwner])

    return (
        <>
            {props.isBackward && treeMessageIdentities.length > 0 && (
                <ReplyTreeMessage
                    messageID={treeMessageIdentities[0].messageID}
                    messageOwner={treeMessageIdentities[0].messageOwner}
                    isBackward={true}
                />
            )}
            {props.messageID && props.messageOwner && (
                <Paper
                    sx={{
                        padding: '20px',
                        scale: '90%'
                    }}
                >
                    <MessageContainer messageID={props.messageID} messageOwner={props.messageOwner} />
                </Paper>
            )}
            {!props.isBackward &&
                treeMessageIdentities.length > 0 &&
                treeMessageIdentities.map((messageIdentity) => (
                    <ReplyTreeMessage
                        key={messageIdentity.messageID}
                        messageID={messageIdentity.messageID}
                        messageOwner={messageIdentity.messageOwner}
                        isBackward={false}
                    />
                ))}
        </>
    )
}
