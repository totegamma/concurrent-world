import { useContext } from 'react'
import { ClockContext } from '../App'
import { humanReadableTimeDiff } from '../util'
import { Box } from '@mui/material'

export interface TimeDiffProps {
    date: Date
}

export const TimeDiff = (props: TimeDiffProps): JSX.Element => {
    useContext(ClockContext)
    return <Box sx={{ width: 'max-content' }}>{humanReadableTimeDiff(props.date)}</Box>
}
