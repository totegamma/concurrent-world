import { Box, Divider, Typography } from '@mui/material'
import { CCEditor } from '../components/cceditor'
import { Schemas } from '../schemas'
import { useCallback } from 'react'

export function Devtool(): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                padding: '20px',
                backgroundColor: 'background.paper',
                minHeight: '100%',
                overflowY: 'scroll'
            }}
        >
            <Typography variant="h2">Devtool</Typography>
            <Divider />
            <CCEditor schemaURL={Schemas.profile} onSubmit={useCallback((_) => {}, [])} />
        </Box>
    )
}
