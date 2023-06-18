import React from 'react'
import styles from './CustomDragPreview.module.css'
import { styled } from '@mui/material/styles'

const StyledDiv = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main
}))

export const CustomDragPreview = (props: any): JSX.Element => {
    const item = props.monitorProps.item

    return (
        <StyledDiv className={styles.root}>
            <div className={styles.label}>{item.text}</div>
        </StyledDiv>
    )
}
