export function onRequest(context) {
    const { path } = context.params
    const [messageId, ccid] = path.split('@')

    return new Response(`Message ID: ${messageId}, CCID: ${ccid}`)
}
