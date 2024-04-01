export async function onRequest(context) {
    const { path } = context.params
    const [messageId, ccid] = path.split('@')

    const { content } = await fetch(`https://hub.concurrent.world/api/v1/address/${ccid}`)
        .then((response) => response.json())
        .then((data) => data)

    return new Response(`Message ID: ${messageId}, CCID: ${ccid}, Content: ${content}`)
}
