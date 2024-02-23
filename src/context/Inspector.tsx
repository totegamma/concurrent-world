import { Alert, Box, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { validateSignature, type CoreMessage, type CoreAssociation } from '@concurrent-world/client'
import { Codeblock } from '../components/ui/Codeblock'
import { MessageContainer } from '../components/Message/MessageContainer'
import { CCDrawer } from '../components/ui/CCDrawer'
import { type Key } from '@concurrent-world/client/dist/types/model/core'
import { KeyCard } from '../components/ui/KeyCard'

export interface InspectorState {
    inspectingItem: { messageId: string; author: string } | null
    inspectItem: React.Dispatch<React.SetStateAction<{ messageId: string; author: string } | null>>
}

const InspectorContext = createContext<InspectorState | undefined>(undefined)

interface InspectorProps {
    children: JSX.Element | JSX.Element[]
}

export const InspectorProvider = (props: InspectorProps): JSX.Element => {
    const client = useApi()
    const [inspectingItem, inspectItem] = useState<{ messageId: string; author: string } | null>(null)
    const [message, setMessage] = useState<CoreMessage<any> | undefined>()
    const [associations, setAssociations] = useState<Array<CoreAssociation<any>>>([])
    const [keyResolution, setKeyResolution] = useState<Key[]>([])

    useEffect(() => {
        if (!inspectingItem) return

        client.api.getMessageWithAuthor(inspectingItem.messageId, inspectingItem.author).then((msg) => {
            if (!msg) return
            setMessage(msg)
            if (msg.payload.keyID && msg.payload.keyID !== '') {
                client.api.getKeychain(msg.payload.keyID).then((keys) => {
                    console.log('resolution:', keys)
                    setKeyResolution(keys)
                })
            }
        })

        client.api.getMessageAssociationsByTarget(inspectingItem.messageId, inspectingItem.author).then((assocs) => {
            setAssociations(assocs)
        })
    }, [inspectingItem])

    const signatureIsValid = useMemo(() => {
        if (message) {
            return validateSignature(
                message.rawpayload,
                message.signature,
                message.payload.keyID ?? message.payload.signer
            )
        }
        return false
    }, [message])

    const previewMessage = useMemo(() => {
        const msg: any = message
        if (msg) {
            msg.associations = 'REDACTED'
            msg.ownAssociations = 'REDACTED'
        }
        return msg
    }, [message])

    const isSignedBySubkey = useMemo(() => {
        if (message) {
            return message.payload.keyID && message.payload.keyID !== ''
        }
        return false
    }, [message])

    const isKeyResolutionOK = useMemo(() => {
        const allKeyValid = keyResolution.every((key) => {
            try {
                return validateSignature(key.enactPayload, key.enactSignature, key.parent)
            } catch (e) {
                return false
            }
        })

        if (!allKeyValid) return false

        const allKeyNotRevoked = keyResolution.every((key) => {
            console.log('checking key:', key)
            if (key.revokePayload?.startsWith('{') && key.revokeSignature) {
                try {
                    const obj = JSON.parse(key.revokePayload)
                    return !validateSignature(key.revokePayload, key.revokeSignature, obj.keyID ?? obj.signer)
                } catch (e) {
                    return true
                }
            } else {
                console.log('none')
            }
            return true
        })

        if (!allKeyNotRevoked) return false

        const rootkey = keyResolution[0]?.root
        if (!rootkey) return true

        let previousKey: string | null = null

        for (let i = 1; i < keyResolution.length; i++) {
            if (keyResolution[i].root !== rootkey) return false
            if (previousKey && keyResolution[i].parent !== previousKey) return false
            previousKey = keyResolution[i].id
        }

        return true
    }, [keyResolution])

    return (
        <InspectorContext.Provider
            value={useMemo(() => {
                return {
                    inspectingItem,
                    inspectItem
                }
            }, [])}
        >
            {props.children}
            <CCDrawer
                open={!!inspectingItem}
                onClose={() => {
                    inspectItem(null)
                }}
            >
                {inspectingItem && message ? (
                    <Box
                        sx={{
                            p: 1,
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        <Typography variant="h1">Inspect</Typography>
                        <Paper sx={{ m: '10px 0', p: '0 20px' }} elevation={0} variant="outlined">
                            <MessageContainer messageID={message.id} messageOwner={message.author} />
                        </Paper>
                        <Typography variant="h2" sx={{ mt: 1 }}>
                            CheckSig:
                        </Typography>

                        {signatureIsValid ? (
                            isSignedBySubkey ? (
                                <Alert severity="success">
                                    Signature is valid!
                                    <br />
                                    With subkey:
                                    <br />
                                    {message.payload.keyID}
                                </Alert>
                            ) : (
                                <Alert severity="success">Signature is valid!</Alert>
                            )
                        ) : (
                            <Alert severity="error">Signature is invalid!</Alert>
                        )}

                        {isSignedBySubkey && (
                            <>
                                <Typography variant="h2" sx={{ mt: 1 }}>
                                    CheckKeyResolution:
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}
                                >
                                    {isKeyResolutionOK ? (
                                        <Alert severity="success">Key resolution is valid!</Alert>
                                    ) : (
                                        <Alert severity="error">Key resolution is invalid!</Alert>
                                    )}

                                    {keyResolution.map((key) => (
                                        <KeyCard short key={key.id} item={key} />
                                    ))}
                                </Box>
                            </>
                        )}

                        <Typography variant="h2" sx={{ mt: 1 }}>
                            Message:
                        </Typography>
                        <Box
                            sx={{
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}
                        >
                            <Codeblock language="json">
                                {JSON.stringify(previewMessage ?? 'null', null, 4)?.replaceAll('\\n', '\n')}
                            </Codeblock>
                        </Box>
                        <Typography variant="h2" sx={{ mt: 1 }}>
                            Associations:
                        </Typography>
                        <Box
                            sx={{
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}
                        >
                            <Codeblock language={'json'}>{JSON.stringify(associations, null, 4)}</Codeblock>
                        </Box>
                    </Box>
                ) : (
                    <Box>nothing to inspect...</Box>
                )}
            </CCDrawer>
        </InspectorContext.Provider>
    )
}

export function useInspector(): InspectorState {
    return useContext(InspectorContext) as InspectorState
}
