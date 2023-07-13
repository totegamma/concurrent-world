import { useEffect, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckIcon from '@mui/icons-material/Check'

import styles from './CustomNode.module.css'
import type { NodeModel } from '@minoru/react-dnd-treeview'
import { type CoreStream } from '@concurrent-world/client'
import type { WatchStream } from './index'
import { useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import { useApi } from '../../context/api'

const CustomNodeText = styled('div')(({ theme }) => ({}))

interface CustomNodeProps {
    node: NodeModel<CoreStream<any>>
    depth: number
    isOpen: boolean
    onToggle: (id: string | number) => void
    tree: WatchStream[]
    setWatchStreamTree: (watchStreamTree: any) => void
    onClick?: () => void
}

export const CustomNode = (props: CustomNodeProps): JSX.Element => {
    const indent = props.depth * 12

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
        props.onClick?.()
    }

    const isSelected = (): boolean => {
        if (!props.node.data) return false
        return window.location.hash === `#${props.node.id}`
    }

    const selectedStyle = isSelected()
        ? {
              color: 'background.default',
              backgroundColor: 'background.contrastText',
              borderRadius: '5px',
              paddingLeft: '7.5px'
          }
        : {
              color: 'background.contrastText',
              paddingLeft: '7.5px'
          }

    const [streamName, setStreamName] = useState<string>('')
    const api = useApi()
    useEffect(() => {
        if (!props.node.data) return
        api.api.readStream(props.node.data.id).then((stream) => {
            setStreamName(stream?.payload.body.name ?? props.node.data)
        })
    }, [props.node.id, api])

    if (props.node.data) {
        return (
            <div className={`tree-node ${styles.root}`} style={{ paddingInlineStart: indent }}>
                <div className={`${styles.expandIconWrapperText} `} onClick={handleToggle}></div>
                <CustomNodeText className={styles.labelGridItem} onClick={handleToggle} sx={selectedStyle}>
                    <div role={'button'} className={styles.streamName} onClick={handleNavigate}>{`${streamName}`}</div>
                </CustomNodeText>
            </div>
        )
    }

    return (
        <div
            className={`tree-node ${styles.root}`}
            style={{ paddingInlineStart: indent }}
            onMouseEnter={() => {
                setIsHovering(true)
            }}
            onMouseLeave={() => {
                setIsHovering(false)
            }}
        >
            <div className={`${styles.expandIconWrapper} ${props.isOpen ? styles.isOpen : ''}`} onClick={handleToggle}>
                {props.node.droppable && (
                    <div>
                        <ArrowRightIcon />
                    </div>
                )}
            </div>
            {isEditing && (
                <div className={styles.editingContainer}>
                    <input ref={nameRef} type="text" defaultValue={props.node.text} />
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
                    <Typography variant="body1" className={styles.folderName}>{`${props.node.text}`}</Typography>
                </div>
            )}
            {!isEditing && props.node.droppable && isHovering && (
                <div className={styles.folderIcons}>
                    <DeleteIcon onClick={handleDelete} sx={{ marginLeft: '5px' }} fontSize={'small'} />
                    <EditIcon onClick={handleEdit} fontSize={'small'} />
                </div>
            )}
        </div>
    )
}
