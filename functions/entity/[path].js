export async function onRequest(context) {
    const { path } = context.params
    const ccid = path

    const { content } = await fetch(`https://hub.concurrent.world/api/v1/address/${ccid}`)
        .then((response) => response.json())
        .then((data) => data)

    const characters = await fetch(
        `https://${content}/api/v1/characters?author=${ccid}&schema=https%3A%2F%2Fraw.githubusercontent.com%2Ftotegamma%2Fconcurrent-schemas%2Fmaster%2Fcharacters%2Fprofile%2F0.0.2.json`
    )
        .then((res) => res.json())
        .then((data) => data)

    const username = JSON.parse(characters.content[0].payload).body.username
    const avatar = JSON.parse(characters.content[0].payload).body.avatar

    const description = JSON.parse(characters.content[0].payload).body.description

    const responseBody = `<meta property="og:title" content="${username} on Concurrent">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${avatar}">
<meta property="twitter:card" content="summary">`

    return new Response(responseBody, {
        headers: {
            'Content-Type': 'text/html'
        }
    })
}
