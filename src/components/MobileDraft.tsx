import { Box, Button, Divider } from '@mui/material'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { CCPostEditor } from './Editor/CCPostEditor'

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
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'text.disabled',
                width: '100%',
                height: '100%'
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
        </Box>
    )
}
