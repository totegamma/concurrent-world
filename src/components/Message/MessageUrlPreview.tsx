import type { M_Current, M_Reply } from '@concurrent-world/client'
import { type APIResponse, LinkPreview } from '@dhaiwat10/react-link-preview'
import { Box } from '@mui/material'
import { usePreference } from '../../context/PreferenceContext'

export interface MessageUrlPreviewProps {
    message: M_Current | M_Reply
}

export const MessageUrlPreview = (props: MessageUrlPreviewProps): JSX.Element | null => {
    const messageBody = props.message.body
    const pref = usePreference()

    // check if messageBody contains a url
    const urls = messageBody.match(/(https?:\/\/[^\s]+)/g)

    if (!urls) return null

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0, sm: '2.5%' } }}>
            {urls.map((url, i) => {
                return (
                    <Box key={i} sx={{ maxWidth: { xs: '100%', sm: '45%' }, maxHeight: 400 }}>
                        <LinkPreview
                            url={url}
                            width="100%"
                            height="100%"
                            fetcher={async (url): Promise<APIResponse | null> => {
                                const response = await fetch(`${pref.mediaProxy}v2?url=${url}`)
                                const json = await response.json()
                                return json.metadata
                            }}
                        />
                    </Box>
                )
            })}
        </Box>
    )
}
