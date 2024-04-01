export function onRequest(context) {
    return new Response(`Message id: ${context.params.id}!`)
}
