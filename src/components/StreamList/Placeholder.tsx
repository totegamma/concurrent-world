import React from 'react'
import styles from './Placeholder.module.css'
import { styled } from '@mui/material/styles'

const StyledDiv = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main
}))

export const Placeholder = (props: any): JSX.Element => {
    const left = props.depth * 24
    return <StyledDiv className={styles.root} style={{ left }}></StyledDiv>
}
