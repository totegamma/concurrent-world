import { type SxProps } from '@mui/material'
import { type CommunityTimelineSchema, type Timeline, type CreateCurrentOptions } from '@concurrent-world/client'
import { CCPostEditor } from './Editor/CCPostEditor'

export interface DraftProps {
    submitButtonLabel?: string
    streamPickerInitial: Array<Timeline<CommunityTimelineSchema>>
    streamPickerOptions: Array<Timeline<CommunityTimelineSchema>>
    onSubmit: (text: string, destinations: string[], options?: CreateCurrentOptions) => Promise<Error | null>
    allowEmpty?: boolean
    autoFocus?: boolean
    placeholder?: string
    sx?: SxProps
    value?: string
    defaultPostHome?: boolean
}

export const Draft = (props: DraftProps): JSX.Element => {
    return <CCPostEditor minRows={3} maxRows={7} {...props} />
}
