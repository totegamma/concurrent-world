const escapeHtml = (unsafe) => {
    return unsafe
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#039;')
}

export async function onRequest(context) {
    const { path } = context.params
    const [streamId, host] = path.split('@')

    const { content } = await fetch(`https://${host}/api/v1/stream/${streamId}`)
        .then((response) => response.json())
        .then((data) => data)

    const payload = JSON.parse(content.payload)

    const name = escapeHtml(payload.name)
    const description = escapeHtml(payload.description)
    const imageUrl = escapeHtml(payload.banner)

    const responseBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
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
