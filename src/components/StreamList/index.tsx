import React, { useContext, useEffect, useState } from 'react'
import {
    DndProvider,
    getBackendOptions,
    MultiBackend,
    Tree
} from '@minoru/react-dnd-treeview'
import { CreateNewFolder } from '@mui/icons-material'

import styles from './index.module.css'
import {
    Box,
    CssBaseline,
    IconButton,
    ThemeProvider,
    Typography,
    useTheme
} from '@mui/material'
import type { Stream, ConcurrentTheme } from '../../model'
import { CustomNode } from './CustomNode'
import { CustomDragPreview } from './CustomDragPreview'
import { Placeholder } from './Placeholder'
import { ApplicationContext } from '../../App'
import { usePersistent } from '../../hooks/usePersistent'

interface Props {
    streams: string[]
}

const initialData = [
    {
        id: 1,
        parent: 0,
        droppable: true,
        text: 'Folder 1'
    },
    {
        id: 2,
        parent: 1,
        text: 'File 1-1'
    },
    {
        id: 3,
        parent: 1,
        text: 'File 1-2'
    },
    {
        id: 4,
        parent: 0,
        droppable: true,
        text: 'Folder 2'
    },
    {
        id: 5,
        parent: 4,
        droppable: true,
        text: 'Folder 2-1'
    },
    {
        id: 6,
        parent: 5,
        text: 'File 2-1-1'
    }
]

export interface WatchStream {
    id: number
    parent: number
    droppable: boolean
    text: string
    data: Stream | undefined
}

export function StreamList(props: Props): JSX.Element {
    const appData = useContext(ApplicationContext)
    const theme = useTheme<ConcurrentTheme>()
    const [watchStreams, setWatchStreams] = useState<Stream[]>([])
    const [watchStreamTree, setWatchStreamTree] = usePersistent<WatchStream[]>(
        'watchStreamTree',
        []
    )
    const [treeData, setTreeData] = useState<WatchStream[]>([])

    useEffect(() => {
        ;(async () => {
            const streams = await Promise.all(
                props.streams.map(
                    async (id) => await appData.streamDict.get(id)
                )
            )

            setWatchStreams(streams)
            setWatchStreamTree(
                streams.map((stream, index) => ({
                    id: index,
                    parent: 0,
                    droppable: false,
                    text: JSON.parse(stream.meta).name || 'Unknown',
                    data: stream
                }))
            )
            setTreeData(watchStreamTree)
        })()
    }, [props.streams])

    const handleDrop = (newTreeData: any): void => {
        setTreeData(newTreeData)
    }

    return (
        <>
            <Box display={'flex'} flexDirection={'row'}>
                <Typography flex={1}>Streams</Typography>
                <IconButton
                    sx={{ color: 'background.contrastText' }}
                    aria-label="add to shopping cart"
                    className={'plus-icon'}
                    size={'small'}
                >
                    <CreateNewFolder fontSize={'small'} />
                </IconButton>
            </Box>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <DndProvider
                    backend={MultiBackend}
                    options={getBackendOptions()}
                >
                    <div className={styles.app}>
                        <Tree
                            tree={treeData}
                            rootId={0}
                            render={(node, { depth, isOpen, onToggle }) => (
                                <CustomNode
                                    node={node}
                                    depth={depth}
                                    isOpen={isOpen}
                                    onToggle={onToggle}
                                />
                            )}
                            dragPreviewRender={(monitorProps) => (
                                <CustomDragPreview
                                    monitorProps={monitorProps}
                                />
                            )}
                            onDrop={handleDrop}
                            classes={{
                                root: styles.treeRoot,
                                draggingSource: styles.draggingSource,
                                placeholder: styles.placeholderContainer
                            }}
                            sort={false}
                            insertDroppableFirst={false}
                            canDrop={(
                                tree,
                                { dragSource, dropTargetId, dropTarget }
                            ) => {
                                if (dragSource?.parent === dropTargetId) {
                                    return true
                                }
                            }}
                            dropTargetOffset={5}
                            placeholderRender={(node, { depth }) => (
                                <Placeholder node={node} depth={depth} />
                            )}
                        />
                    </div>
                </DndProvider>
            </ThemeProvider>
        </>
    )
}
