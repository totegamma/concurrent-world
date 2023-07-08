import { Box, ListItem, Skeleton } from '@mui/material'

export const MessageSkeleton = (): JSX.Element => {
    return (
        <ListItem
            sx={{
                alignItems: 'flex-start',
                flex: 1,
                p: { xs: '7px 0', sm: '10px 0' },
                height: 105,
                gap: '10px'
            }}
        >
            <Skeleton animation="wave" variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
                <Skeleton animation="wave" />
                <Skeleton animation="wave" height={80} />
            </Box>
        </ListItem>
    )
}
