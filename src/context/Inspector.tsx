import {
    Alert,
    Box,
    Drawer,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import type { Character, Message, StreamElement } from '../model'
import { Schemas } from '../schemas'
import type { Profile } from '../schemas/profile'
import { MessageFrame } from '../components/Timeline'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { validateSignature } from '../util'

export interface InspectorState {
    inspectingItem: StreamElement | null
    inspectItem: React.Dispatch<React.SetStateAction<StreamElement | null>>
}

const InspectorContext = createContext<InspectorState | undefined>(undefined)

interface InspectorProps {
    children: JSX.Element | JSX.Element[]
}

export const InspectorProvider = (props: InspectorProps): JSX.Element => {
    const api = useApi()
    const theme = useTheme()
    const greaterThanMid = useMediaQuery(theme.breakpoints.up('md'))
    const [inspectingItem, inspectItem] = useState<StreamElement | null>(null)
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [signatureIsValid, setSignatureIsValid] = useState<boolean>(false)

    useEffect(() => {
        if (!inspectingItem) return
        api.fetchMessage(inspectingItem.id, inspectingItem.currenthost).then((msg) => {
            if (!msg) return
            setSignatureIsValid(validateSignature(msg.rawpayload, msg.signature, msg.author))
            setMessage(msg)
        })
        api.readCharacter(inspectingItem.author, Schemas.profile, inspectingItem.currenthost).then((author) => {
            setAuthor(author)
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

            <Drawer
                anchor={greaterThanMid ? 'right' : 'bottom'}
                open={inspectingItem != null}
                onClose={() => {
                    inspectItem(null)
                }}
                PaperProps={{
                    sx: {
                        width: {
                            md: '40vw'
                        },
                        height: {
                            xs: '80vh',
                            md: '100%'
                        },
                        borderRadius: {
                            xs: '20px 20px 0 0',
                            md: '20px 0 0 20px'
                        },
                        overflowY: 'hidden',
                        padding: '20px 0 10px 20px'
                    }
                }}
            >
                {inspectingItem && message ? (
                    <Box
                        sx={{
                            margin: 0,
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            height: '100%',
                            overflowY: 'auto',
                            paddingRight: '10px'
                        }}
                    >
                        <Typography variant="h1">Inspect</Typography>
                        <Paper sx={{ m: '10px 0', p: '0 20px' }} elevation={0} variant="outlined">
                            <MessageFrame message={inspectingItem} lastUpdated={0} />
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
                                    <TableCell>{inspectingItem.currenthost}</TableCell>
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
                            <SyntaxHighlighter
                                style={materialDark}
                                language="json"
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '10px 15px', overflow: 'auto' }}
                                codeTagProps={{ style: { fontFamily: 'Source Code Pro, monospace' } }}
                            >
                                {JSON.stringify(message.payload ?? 'null', null, 4)?.replaceAll('\\n', '\n')}
                            </SyntaxHighlighter>
                        </Box>
                        <Typography variant="h2">Associations:</Typography>
                        <Box
                            sx={{
                                borderRadius: '10px',
                                overflow: 'hidden'
                            }}
                        >
                            <SyntaxHighlighter
                                style={materialDark}
                                language={'json'}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '10px 15px', overflow: 'auto' }}
                                codeTagProps={{ style: { fontFamily: 'Source Code Pro, monospace' } }}
                            >
                                {JSON.stringify(message.associations, null, 4)}
                            </SyntaxHighlighter>
                        </Box>
                    </Box>
                ) : (
                    <Box>nothing to inspect...</Box>
                )}
            </Drawer>
        </InspectorContext.Provider>
    )
}

export function useInspector(): InspectorState {
    return useContext(InspectorContext) as InspectorState
}
