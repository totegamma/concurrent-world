import type {
    ApiResponse, CoreEntity, CoreMessage, CoreProfile, WorldMessage, WorldProfile
} from '../../types/concurrent'
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
        console.log(`[message, cache not found]`)

        const { path } = context.params
        const [messageId, ccid] = (<string>path).split('@')

        const entity: CoreEntity = await fetch(`https://ariake.concrnt.net/api/v1/entity/${ccid}`)
            .then((response) => response.json<ApiResponse<CoreEntity>>())
            .then((data) => data.content)

        const message: CoreMessage = await fetch(`https://${entity.domain}/api/v1/message/${messageId}`)
            .then((response) => response.json<ApiResponse<CoreMessage>>())
            .then((data) => data.content)

        const messageBody: WorldMessage = JSON.parse(message.document).body
        const content = messageBody.body

        const profile: CoreProfile = await fetch(`https://${entity.domain}/api/v1/profile/${entity.ccid}/world.concrnt.p`)
            .then((response) => response.json<ApiResponse<CoreProfile>>())
            .then((data) => data.content)

        const worldProfile: WorldProfile = JSON.parse(profile.document).body

        const username = sanitizeHtml(worldProfile.username)
        const avatar = sanitizeHtml(worldProfile.avatar)

        let responseBody = ''

        const imageRegex = /!\[[^\]]*\]\(([^\)]*)\)/

        if (content.match(imageRegex)) {
            const imageUrl = content.match(imageRegex)[1]
            responseBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${username} on Concrnt">
    <meta property="og:description" content="${content.slice(0, content.search(imageRegex))}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="twitter:card" content="summary_large_image">
  </head>
</html>`
        } else {
            responseBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${username} on Concrnt">
    <meta property="og:description" content="${content}">
    <meta property="og:image" content="${avatar}">
    <meta property="twitter:card" content="summary">
  </head>
</html>`
        }

        response = new Response(responseBody, {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': `s-maxage=${CACHE_TTL_SECONDS}`
            }
        })

        context.waitUntil(cache.put(cacheKey, response.clone()))
    } else {
        console.log(`[message, cache found]`)
    }

    return response
}
