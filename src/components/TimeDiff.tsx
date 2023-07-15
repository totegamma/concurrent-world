import { useContext } from 'react'
import { ClockContext } from '../App'
import { humanReadableTimeDiff } from '../util'
import { Box, Tooltip } from '@mui/material'

export interface TimeDiffProps {
    date: Date
}

export const TimeDiff = (props: TimeDiffProps): JSX.Element => {
    useContext(ClockContext)
    return (
        <Tooltip placement="left" title={props.date.toLocaleString()}>
            <Box component="span" width="max-content">
                {humanReadableTimeDiff(props.date)}
            </Box>
        </Tooltip>
    )
}
