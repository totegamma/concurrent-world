import React from 'react'
import Typography from '@mui/material/Typography'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { TypeIcon } from './TypeIcon'
import styles from './CustomNode.module.css'

export const CustomNode = (props: any): JSX.Element => {
    const { droppable, data } = props.node
    const indent = props.depth * 24

    const handleToggle = (e: any): void => {
        e.stopPropagation()
        props.onToggle(props.node.id)
    }

    return (
        <div
            className={`tree-node ${styles.root}`}
            style={{ paddingInlineStart: indent }}
        >
            <div
                className={`${styles.expandIconWrapper} ${
                    props.isOpen ? styles.isOpen : ''
                }`}
            >
                {props.node.droppable && (
                    <div onClick={handleToggle}>
                        <ArrowRightIcon />
                    </div>
                )}
            </div>
            <div>
                <TypeIcon
                    droppable={droppable || false}
                    fileType={data?.fileType}
                />
            </div>
            <div className={styles.labelGridItem}>
                {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
                <Typography variant="body2">{`${props.node.text}`}</Typography>
            </div>
        </div>
    )
}
