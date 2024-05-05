import type { AddressResponse, Stream } from '../../types/concurrent'
import { sanitizeHtml } from '../../lib/sanitize'

const CACHE_TTL_SECONDS = 21600

export const onRequest: PagesFunction = async (context) => {
    const cacheUrl = new URL(context.request.url)

    const cacheKey = new Request(cacheUrl.toString(), context.request)

    // Cloudflare Workersの@CacheStorageタイプはcaches.defaultがあるが、ブラウザのCacheStorageはcaches.defaultがないのでエラーが出る
    // @ts-ignore
    const cache = caches.default

    let response = await cache.match(cacheKey)

    if (!response) {
        console.log(`\n[stream, cache not found]`)

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

        response = new Response(responseBody, {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}`
            }
        })

        context.waitUntil(cache.put(cacheKey, response.clone()))
    } else {
        console.log(`\n[stream, cache found]`)
    }

    return response
}
