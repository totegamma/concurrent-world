import type {
    ApiResponse, CoreEntity, CoreMessage, CoreProfile, WorldMessage, WorldProfile
} from '../types/concurrent'
import { sanitizeHtml } from '../lib/sanitize'
import { CACHE_TTL_SECONDS, CCWORLD } from '../constants'

// catchall: [ccid, messageId]

export const onRequest: PagesFunction = async (context) => {

    const url = new URL(context.request.url)
    const cacheKey = url.origin + url.pathname
    const originalPath = CCWORLD + url.pathname.replace('/og', '')

    if (url.pathname.split('/').length !== 4) {
        // redirect to home
        return Response.redirect(
            CCWORLD,
            301
        )
    }

    // Cloudflare Workersの@CacheStorageタイプはcaches.defaultがあるが、ブラウザのCacheStorageはcaches.defaultがないのでエラーが出る
    // @ts-ignore
    const cache = caches.default
    let response = await cache.match(cacheKey)

    if (!response) {
        console.log(`[message, cache not found]`)

        const [ccid, messageId] = context.params.catchall

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
    <meta name="theme-color" content="#0476d9" />
    <script>
        window.location.href = "${originalPath}"
    </script>
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
    <meta name="theme-color" content="#0476d9" />
    <script>
        window.location.href = "${originalPath}"
    </script>
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
