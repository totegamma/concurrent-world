import { Box, Divider, Typography, useTheme } from '@mui/material'
import type { StreamElementDated } from '../model'
import type { IuseObjectList } from '../hooks/useObjectList'
import { useContext, useEffect, useRef } from 'react'
import { ApplicationContext } from '../App'
import { Timeline } from '../components/Timeline'

export interface NotificationsProps {
    messages: IuseObjectList<StreamElementDated>
    currentStreams: string[]
    setCurrentStreams: (input: string[]) => void
}

export function Notifications(props: NotificationsProps): JSX.Element {
    const theme = useTheme()
    const appData = useContext(ApplicationContext)
    const scrollParentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const myassociations = appData.userstreams?.payload.body.notificationStream
        if (!myassociations) return
        props.setCurrentStreams([myassociations])
        scrollParentRef.current?.scroll({ top: 0 })
    }, [appData.userstreams])

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
            <Typography variant="h2" gutterBottom>
                Notifications
            </Typography>
            <Divider />
            <Box
                sx={{
                    width: '100%',
                    padding: { xs: '8px', sm: '8px 16px' },
                    background: theme.palette.background.paper,
                    minHeight: '100%'
                }}
                ref={scrollParentRef}
            >
                <Box sx={{ display: 'flex', flex: 1 }}>
                    <Timeline
                        streams={props.currentStreams}
                        timeline={props.messages}
                        scrollParentRef={scrollParentRef}
                    />
                </Box>
            </Box>
        </Box>
    )
}
