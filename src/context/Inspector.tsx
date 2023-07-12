import {
    Alert,
    Box,
    Paper,
    SwipeableDrawer,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    styled,
    useMediaQuery,
    useTheme
} from '@mui/material'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { type Character, type Message, Schemas, validateSignature, type Profile } from '@concurrent-world/client'
import grey from '@mui/material/colors/grey'
import { Codeblock } from '../components/Codeblock'
import { MessageContainer } from '../components/Timeline/MessageContainer'

export interface InspectorState {
    inspectingItem: { messageId: string; author: string } | null
    inspectItem: React.Dispatch<React.SetStateAction<{ messageId: string; author: string } | null>>
}

const InspectorContext = createContext<InspectorState | undefined>(undefined)

interface InspectorProps {
    children: JSX.Element | JSX.Element[]
}

const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)'
}))

export const InspectorProvider = (props: InspectorProps): JSX.Element => {
    const api = useApi()
    const theme = useTheme()
    const greaterThanMid = useMediaQuery(theme.breakpoints.up('md'))
    const [inspectingItem, inspectItem] = useState<{ messageId: string; author: string } | null>(null)
    const [author, setAuthor] = useState<Character<Profile> | undefined>()
    const [message, setMessage] = useState<Message<any> | undefined>()
    const [signatureIsValid, setSignatureIsValid] = useState<boolean>(false)
    const [currentHost, setCurrentHost] = useState<string>('')

    useEffect(() => {
        if (!inspectingItem) return

        api.fetchMessageWithAuthor(inspectingItem.messageId, inspectingItem.author).then((msg) => {
            if (!msg) return
            setSignatureIsValid(validateSignature(msg.rawpayload, msg.signature, msg.author))
            setMessage(msg)
        })
        api.readCharacter(inspectingItem.author, Schemas.profile).then((author) => {
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

            <SwipeableDrawer
                disableSwipeToOpen
                anchor={greaterThanMid ? 'right' : 'bottom'}
                open={inspectingItem != null}
                onOpen={() => {}}
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
                <Puller visibility={greaterThanMid ? 'hidden' : 'visible'} />
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
                                {/* <TableRow> */}
                                {/*     <TableCell> */}
                                {/*         <b>Host</b> */}
                                {/*     </TableCell> */}
                                {/*     <TableCell>{inspectingItem.currenthost}</TableCell> */}
                                {/* </TableRow> */}
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
                            <Codeblock language={'json'}>{JSON.stringify(message.associations, null, 4)}</Codeblock>
                        </Box>
                    </Box>
                ) : (
                    <Box>nothing to inspect...</Box>
                )}
            </SwipeableDrawer>
        </InspectorContext.Provider>
    )
}

export function useInspector(): InspectorState {
    return useContext(InspectorContext) as InspectorState
}
