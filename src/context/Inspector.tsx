import type { Message } from '../model'
import { Box, Drawer, Typography } from '@mui/material'
import { createContext, useContext, useMemo, useState } from 'react'

interface InspectorState {
    inspectingItem: Message<any> | null
    inspectItem: React.Dispatch<React.SetStateAction<Message<any> | null>>
}

const InspectorContext = createContext<InspectorState | undefined>(undefined)

interface InspectorProps {
    children: JSX.Element | JSX.Element[]
}

export const InspectorProvider = (props: InspectorProps): JSX.Element => {
    const [inspectingItem, inspectItem] = useState<Message<any> | null>(null)

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
                anchor={'right'}
                open={inspectingItem != null}
                onClose={() => {
                    inspectItem(null)
                }}
                PaperProps={{
                    sx: {
                        width: '40vw',
                        borderRadius: '20px 0 0 20px',
                        overflow: 'hidden',
                        padding: '20px'
                    }
                }}
            >
                {inspectingItem ? (
                    <Box
                        sx={{
                            margin: 0,
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            fontSize: '13px'
                        }}
                    >
                        <Typography>ID: {inspectingItem.id}</Typography>
                        <Typography>Author: {inspectingItem.author}</Typography>
                        <Typography>Schema: {inspectingItem.schema}</Typography>
                        <Typography>Signature: {inspectingItem.signature}</Typography>
                        <Typography>Streams: {inspectingItem.streams}</Typography>
                        <Typography>Created: {inspectingItem.cdate}</Typography>
                        <Typography>Payload:</Typography>
                        <pre style={{ overflowX: 'scroll' }}>
                            {JSON.stringify(inspectingItem.payload ?? 'null', null, 4)?.replaceAll('\\n', '\n')}
                        </pre>
                        <Typography>Associations:</Typography>
                        <pre style={{ overflowX: 'scroll' }}>
                            {JSON.stringify(inspectingItem.associations, null, 4)}
                        </pre>
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
