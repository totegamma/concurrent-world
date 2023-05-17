import React, { useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'

import styles from './CustomNode.module.css'
import type { NodeModel } from '@minoru/react-dnd-treeview'
import type { Stream } from '../../model'
import type { WatchStream } from './index'
import { Link, useNavigate } from 'react-router-dom'
import { ListItemButton } from '@mui/material'

interface CustomNodeProps {
    node: NodeModel<Stream>
    depth: number
    isOpen: boolean
    onToggle: (id: string | number) => void
    tree: WatchStream[]
    setWatchStreamTree: (watchStreamTree: any) => void
}

export const CustomNode = (props: CustomNodeProps): JSX.Element => {
    const indent = props.depth * 24

    const [isHovering, setIsHovering] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const nameRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const handleToggle = (e: any): void => {
        e.stopPropagation()
        props.onToggle(props.node.id)
    }

    const handleDelete = (e: any): void => {
        e.stopPropagation()
        const newTree = props.tree.filter((node) => node.id !== props.node.id)
        const deleteChildren = props.tree
            .filter((node) => node.parent === props.node.id)
            .map((node) => {
                return { ...node, parent: 0 }
            })
        props.setWatchStreamTree([...newTree, ...deleteChildren])
    }

    const handleEdit = (e: any): void => {
        e.stopPropagation()
        setIsEditing(true)
        console.log('Edit')
    }

    const updateName = (): void => {
        console.log('Update name')
        const newTree = props.tree.map((node) => {
            if (!nameRef) return node
            if (node.id === props.node.id) {
                node.text = nameRef.current?.value ?? ''
            }
            return node
        })
        props.setWatchStreamTree(newTree)
    }

    const handleNavigate = (e: any): void => {
        if (!props.node.data) return
        e.stopPropagation()
        navigate(`/#${props.node.id}`)
    }

    return (
        <ListItemButton
            className={`tree-node ${styles.root}`}
            style={{ paddingInlineStart: indent }}
            onMouseEnter={() => {
                setIsHovering(true)
            }}
            onMouseLeave={() => {
                setIsHovering(false)
            }}
        >
            <div
                className={`${styles.expandIconWrapper} ${
                    props.isOpen ? styles.isOpen : ''
                }`}
                onClick={handleToggle}
            >
                {props.node.droppable && (
                    <div>
                        <ArrowRightIcon />
                    </div>
                )}
            </div>
            {isEditing && (
                <div className={styles.editingContainer}>
                    <input
                        ref={nameRef}
                        type="text"
                        defaultValue={props.node.text}
                    />
                    <CheckIcon
                        onClick={() => {
                            setIsEditing(false)
                            updateName()
                        }}
                        fontSize={'small'}
                    />
                </div>
            )}
            {!isEditing && (
                <div className={styles.labelGridItem} onClick={handleToggle}>
                    {props.node.data && (
                        <div
                            className={styles.streamName}
                            onClick={handleNavigate}
                        >{`${props.node.text}`}</div>
                    )}
                    {!props.node.data && (
                        <Typography
                            variant="body1"
                            className={styles.folderName}
                        >{`${props.node.text}`}</Typography>
                    )}
                </div>
            )}
            {!isEditing && props.node.droppable && isHovering && (
                <div className={styles.folderIcons}>
                    <DeleteIcon
                        onClick={handleDelete}
                        sx={{ marginLeft: '5px' }}
                        fontSize={'small'}
                    />
                    <EditIcon onClick={handleEdit} fontSize={'small'} />
                </div>
            )}
        </ListItemButton>
    )
}
