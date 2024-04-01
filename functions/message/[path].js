export async function onRequest(context) {
    const { path } = context.params
    const [messageId, ccid] = path.split('@')

    const { content } = await fetch(`https://hub.concurrent.world/api/v1/address/${ccid}`)
        .then((response) => response.json())
        .then((data) => data)

    const message = await fetch(`https://dev.concurrent.world/api/v1/message/${messageId}`)
        .then((response) => response.json())
        .then((data) => data)

    console.log(message)

    // return new Response(`Message ID: ${messageId}, CCID: ${ccid}, Content: ${content}`)
    return new Response(
        `
      <meta property="og:title" content="${ccid}">
      <meta property="og:description" content="${JSON.parse(message.content.payload).body.body}">
      `,
        {
            headers: {
                'Content-Type': 'text/html'
            }
        }
    )
}
