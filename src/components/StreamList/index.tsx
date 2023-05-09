import React, { useState } from 'react'
import {
    DndProvider,
    getBackendOptions,
    MultiBackend,
    Tree
} from '@minoru/react-dnd-treeview'
import { CreateNewFolder } from '@mui/icons-material'

import './index.css'
import { Box, IconButton, Typography, useTheme } from '@mui/material'
import type { ConcurrentTheme } from '../../model'
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

export function StreamList(props: Props): JSX.Element {
    const theme = useTheme<ConcurrentTheme>()

    const [treeData, setTreeData] = useState<any>(initialData)
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
                >
                    <CreateNewFolder />
                </IconButton>
            </Box>
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                <Tree
                    tree={treeData}
                    rootId={0}
                    onDrop={handleDrop}
                    render={(node, { depth, isOpen, onToggle }) => (
                        <div style={{ marginLeft: depth * 10 }}>
                            {node.droppable && (
                                <span onClick={onToggle}>
                                    {isOpen ? '▼' : '▶︎'}
                                </span>
                            )}
                            {node.text}
                        </div>
                    )}
                />
            </DndProvider>
        </>
    )
}

// export function StreamList(props: Props): JSX.Element {
//     const appData = useContext(ApplicationContext)
//     const [watchStreams, setWatchStreams] = useState<Stream[]>([])
//
//     useEffect(() => {
//         ;(async () => {
//             setWatchStreams(
//                 (
//                     await Promise.all(
//                         props.streams.map(
//                             async (id) => await appData.streamDict?.get(id)
//                         )
//                     )
//                 ).filter((e) => e) as Stream[]
//             )
//         })()
//     }, [props.streams])
//
//     return (
//         <Box
//             sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '5px',
//                 overflowY: 'auto',
//                 overflowX: 'hidden'
//             }}
//         >
//             <List
//                 dense
//                 sx={{
//                     width: '100%',
//                     maxWidth: 360,
//                     display: 'flex',
//                     flexDirection: 'column'
//                 }}
//             >
//                 {watchStreams.map((stream) => {
//                     const labelId = `checkbox-list-secondary-label-${stream.id}`
//                     return (
//                         <ListItem key={stream.id} disablePadding>
//                             <ListItemButton
//                                 component={Link}
//                                 to={`/#${stream.id}`}
//                                 sx={{ gap: 1 }}
//                             >
//                                 <PercentIcon
//                                     sx={{
//                                         color: 'background.contrastText'
//                                     }}
//                                 />
//                                 <ListItemText
//                                     id={labelId}
//                                     primary={
//                                         stream.meta
//                                             ? JSON.parse(stream.meta).name
//                                             : 'backrooms'
//                                     }
//                                 />
//                             </ListItemButton>
//                         </ListItem>
//                     )
//                 })}
//             </List>
//         </Box>
//     )
// }
