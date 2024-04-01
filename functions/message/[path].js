export function onRequest(context) {
    const { path } = context.params
    const [messageId, ccid] = path.split('@')

    fetch(`https://hub.concurrent.world/api/v1/address/${ccid}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
        })

    return new Response(`Message ID: ${messageId}, CCID: ${ccid}`)
}
