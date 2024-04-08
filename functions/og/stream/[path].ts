import { sanitizeHtml } from '../../lib/sanitize'

interface AddressResponse {
    content: {
        payload: string
    }
}

interface Stream {
    name: string
    shortname: string
    description: string
    banner: string
}

export const onRequest: PagesFunction = async (context) => {
    const { path } = context.params
    const [streamId, host] = (<string>path).split('@')

    const { content } = await fetch(`https://${host}/api/v1/stream/${streamId}`)
        .then((response) => response.json<AddressResponse>())
        .then((data) => data)

    const payload: Stream = JSON.parse(content.payload)

    const name = sanitizeHtml(payload.name)
    const description = sanitizeHtml(payload.description)
    const imageUrl = sanitizeHtml(payload.banner)

    const responseBody = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${name} on Concurrent">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="twitter:card" content="summary_large_image">
  </head>
</html>`

    return new Response(responseBody, {
        headers: {
            'Content-Type': 'text/html'
        }
    })
}
