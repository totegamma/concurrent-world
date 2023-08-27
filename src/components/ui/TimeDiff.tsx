import { humanReadableTimeDiff } from '../../util'
import { Box, Tooltip } from '@mui/material'
import { useTicker } from '../../context/Ticker'

export interface TimeDiffProps {
    date: Date
}

export const TimeDiff = (props: TimeDiffProps): JSX.Element => {
    useTicker()
    return (
        <Tooltip placement="left" title={props.date.toLocaleString()}>
            <Box component="span" width="max-content">
                {humanReadableTimeDiff(props.date)}
            </Box>
        </Tooltip>
    )
}
