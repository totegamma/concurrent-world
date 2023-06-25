import { useEffect } from 'react'
import { Tree } from '@minoru/react-dnd-treeview'
import CreateNewFolder from '@mui/icons-material/CreateNewFolder'

import styles from './index.module.css'
import { IconButton, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import type { Stream } from '../../model'
import { CustomNode } from './CustomNode'
import { CustomDragPreview } from './CustomDragPreview'
import { Placeholder } from './Placeholder'
import { usePersistent } from '../../hooks/usePersistent'

import { v4 as uuidv4 } from 'uuid'
import PercentIcon from '@mui/icons-material/Percent'
import { useApi } from '../../context/api'
import { useFollow } from '../../context/FollowContext'
export interface WatchStream {
    id: number | string
    parent: number
    droppable: boolean
    text: string
    data: Stream<any> | undefined
}

interface StreamListProps {
    onClick?: () => void
}

export function StreamList(props: StreamListProps): JSX.Element {
    const api = useApi()
    const follow = useFollow()
    const [watchStreamTree, setWatchStreamTree] = usePersistent<WatchStream[]>('watchStreamTree', [])

    useEffect(() => {
        ;(async () => {
            const streams = await Promise.all(follow.bookmarkingStreams.map(async (id) => await api.readStream(id)))
            if (watchStreamTree.length === 0) {
                // init watch stream tree
                console.log('init watch stream tree')
                setWatchStreamTree(
                    streams
                        .map((stream, _) => ({
                            id: stream?.id,
                            parent: 0,
                            droppable: false,
                            text: '',
                            data: stream
                        }))
                        .filter((e) => e.id) as WatchStream[]
                )
            } else {
                // update watch stream three
                console.log('update watch stream tree')
                // when a stream is deleted, remove it from the tree
                const newTree = watchStreamTree.filter((node) => {
                    if (node.data === undefined) {
                        return true
                    }
                    return follow.bookmarkingStreams.includes(node.data.id)
                })
                // when a stream is added, add it to the tree
                streams.forEach((stream) => {
                    if (stream === undefined) {
                        return
                    }
                    if (!watchStreamTree.some((node) => node.data?.id === stream.id)) {
                        newTree.push({
                            id: stream.id,
                            parent: 0,
                            droppable: false,
                            text: '',
                            data: stream
                        })
                    }
                })
                setWatchStreamTree(newTree)
            }
        })()
    }, [follow.bookmarkingStreams])

    const addFolder = (): void => {
        setWatchStreamTree([
            ...watchStreamTree,
            {
                id: uuidv4(),
                parent: 0,
                droppable: true,
                text: 'New Folder',
                data: undefined
            }
        ])
    }

    const handleDrop = (newTreeData: any): void => {
        setWatchStreamTree(newTreeData)
        console.log(newTreeData)
    }

    return (
        <>
            <Box display={'flex'} flexDirection={'row'} gap={'8px'} sx={{ paddingLeft: '16px', paddingTop: '8px' }}>
                <PercentIcon
                    sx={{
                        color: 'background.contrastText'
                    }}
                />
                <Typography flex={1} fontSize={'0.875rem'} justifyContent={'center'} marginY={'3px'}>
                    Streams
                </Typography>

                <IconButton
                    sx={{ color: 'background.contrastText' }}
                    aria-label="add to shopping cart"
                    className={'plus-icon'}
                    size={'small'}
                    onClick={addFolder}
                >
                    <CreateNewFolder fontSize={'small'} />
                </IconButton>
            </Box>
            <div className={styles.tree} style={{ marginRight: 8 }}>
                <Tree
                    tree={watchStreamTree}
                    rootId={0}
                    render={(node, { depth, isOpen, onToggle }) => (
                        <CustomNode
                            node={node}
                            depth={depth}
                            isOpen={isOpen}
                            onToggle={onToggle}
                            tree={watchStreamTree}
                            setWatchStreamTree={setWatchStreamTree}
                            onClick={props.onClick}
                        />
                    )}
                    dragPreviewRender={(monitorProps) => <CustomDragPreview monitorProps={monitorProps} />}
                    onDrop={handleDrop}
                    classes={{
                        root: styles.treeRoot,
                        draggingSource: styles.draggingSource,
                        placeholder: styles.placeholderContainer
                    }}
                    sort={false}
                    insertDroppableFirst={false}
                    canDrop={(tree, { dragSource, dropTargetId, dropTarget }) => {
                        if (dragSource?.parent === dropTargetId) {
                            return true
                        }
                    }}
                    dropTargetOffset={5}
                    placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
                />
            </div>
        </>
    )
}
