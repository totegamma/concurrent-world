import React from 'react'
import styles from './Placeholder.module.css'

export const Placeholder = (props: any): JSX.Element => {
    const left = props.depth * 24
    return <div className={styles.root} style={{ left }}></div>
}
