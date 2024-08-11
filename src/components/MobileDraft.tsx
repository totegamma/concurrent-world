import { Box, Button, Divider, Paper } from '@mui/material'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { CCPostEditor } from './Editor/CCPostEditor'
import { useEffect, useState } from 'react'

export interface MobileDraftProps {
    streamPickerInitial: Array<Timeline<CommunityTimelineSchema>>
    streamPickerOptions: Array<Timeline<CommunityTimelineSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    onCancel?: () => void
    submitButtonLabel?: string
    allowEmpty?: boolean
    placeholder?: string
    value?: string
    context?: JSX.Element
    defaultPostHome?: boolean
}

export const MobileDraft = (props: MobileDraftProps): JSX.Element => {
    const [viewportHeight, setViewportHeight] = useState<number>(visualViewport?.height ?? 0)
    useEffect(() => {
        function handleResize(): void {
            setViewportHeight(visualViewport?.height ?? 0)
        }
        visualViewport?.addEventListener('resize', handleResize)
        return () => visualViewport?.removeEventListener('resize', handleResize)
    }, [])

    return (
        <Box
            sx={{
                height: viewportHeight,
                maxHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                p: 0.5,
                backgroundColor: 'background.default'
            }}
        >
            <Paper
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flex: 1,
                    p: 0.5
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Button
                        variant="text"
                        onClick={() => {
                            props.onCancel?.()
                        }}
                        sx={{
                            px: 1
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
                {props.context && (
                    <>
                        <Divider />
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1
                            }}
                        >
                            {props.context}
                        </Box>
                    </>
                )}
                <Divider />
                <CCPostEditor mobile autoFocus {...props} />
            </Paper>
        </Box>
    )
}
