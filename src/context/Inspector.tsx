import { Alert, Box, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { validateSignature, type CoreMessage, type CoreAssociation } from '@concurrent-world/client'
import { Codeblock } from '../components/ui/Codeblock'
import { MessageContainer } from '../components/Message/MessageContainer'
import { CCDrawer } from '../components/ui/CCDrawer'

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
    const [signatureIsValid, setSignatureIsValid] = useState<boolean>(false)
    const [currentHost, setCurrentHost] = useState<string>('')

    useEffect(() => {
        if (!inspectingItem) return

        client.api.getEntity(inspectingItem.author).then((entity) => {
            if (!entity) return
            setCurrentHost(entity.domain || client.api.host)
        })

        client.api.getMessageWithAuthor(inspectingItem.messageId, inspectingItem.author).then((msg) => {
            if (!msg) return
            setSignatureIsValid(validateSignature(msg.rawpayload, msg.signature, msg.author))
            setMessage(msg)
        })

        client.api.getMessageAssociationsByTarget(inspectingItem.messageId, inspectingItem.author).then((assocs) => {
            setAssociations(assocs)
        })
    }, [inspectingItem])

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
                        {signatureIsValid ? (
                            <Alert severity="success">Signature is valid!</Alert>
                        ) : (
                            <Alert severity="error">Signature is invalid!</Alert>
                        )}
                        <Table sx={{ fontSize: '10px' }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <b>ID</b>
                                    </TableCell>
                                    <TableCell>{message.id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <b>Author</b>
                                    </TableCell>
                                    <TableCell>{message.author}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <b>Host</b>
                                    </TableCell>
                                    <TableCell>{currentHost}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <b>Schema</b>
                                    </TableCell>
                                    <TableCell>{message.schema}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ wordBreak: 'keep-all' }}>
                                        <b>Signature</b>
                                    </TableCell>
                                    <TableCell>{message.signature}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <b>Streams</b>
                                    </TableCell>
                                    <TableCell>{message.streams.join('\n')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <b>Created</b>
                                    </TableCell>
                                    <TableCell>{new Date(message.cdate).toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <Typography variant="h2">Payload:</Typography>
                        <Box
                            sx={{
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}
                        >
                            <Codeblock language="json">
                                {JSON.stringify(message.payload ?? 'null', null, 4)?.replaceAll('\\n', '\n')}
                            </Codeblock>
                        </Box>
                        <Typography variant="h2">Associations:</Typography>
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
