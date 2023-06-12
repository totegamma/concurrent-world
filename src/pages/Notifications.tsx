import { Box, Divider, Typography } from '@mui/material'
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
                width: '100%',
                minHeight: '100%',
                backgroundColor: 'background.paper'
            }}
        >
            <Box
                sx={{
                    padding: '20px 20px 0 20px'
                }}
            >
                <Typography variant="h2" gutterBottom>
                    Notifications
                </Typography>
                <Divider />
            </Box>
            <Box
                sx={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    width: '100%',
                    height: '100%',
                    minHeight: '100%'
                }}
                ref={scrollParentRef}
            >
                <Box sx={{ display: 'flex', flex: 1, padding: { xs: '8px', sm: '8px 16px' } }}>
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
