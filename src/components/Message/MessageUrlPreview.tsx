import type { M_Current, M_Reply } from '@concurrent-world/client'
import { type APIResponse, LinkPreview } from '@dhaiwat10/react-link-preview'

export interface MessageUrlPreviewProps {
    message: M_Current | M_Reply
}

export const MessageUrlPreview = (props: MessageUrlPreviewProps): JSX.Element | null => {
    const messageBody = props.message.body

    // check if messageBody contains a url
    const urls = messageBody.match(/(https?:\/\/[^\s]+)/g)

    if (!urls) return null

    return (
        <LinkPreview
            url={urls[0]}
            width="100%"
            height="100%"
            fetcher={async (url): Promise<APIResponse | null> => {
                const response = await fetch('http://localhost:8000/v2?url=' + url)
                const json = await response.json()
                return json.metadata
            }}
        />
    )
}
