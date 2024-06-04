import { useTranslation } from 'react-i18next'

import { visit } from 'unist-util-visit'
import { inspect } from 'unist-util-inspect'
import { Sign, type CCDocument } from '@concurrent-world/client'

export const jumpToDomainRegistration = (ccid: string, privateKey: string, fqdn: string, callback: string): void => {
    const affiliation: CCDocument.Affiliation = {
        signer: ccid,
        type: 'affiliation',
        domain: fqdn,
        signedAt: new Date()
    }

    const signedDoc = JSON.stringify(affiliation)
    const signature = Sign(privateKey, signedDoc)

    const encodedObject = btoa(signedDoc).replace('+', '-').replace('/', '_').replace('==', '')

    const link = `https://${fqdn}/web/register?registration=${encodedObject}&signature=${signature}&callback=${encodeURIComponent(
        callback
    )}`

    window.location.href = link
}

export const fetchWithTimeout = async (
    url: RequestInfo,
    init: RequestInit,
    timeoutMs = 15 * 1000
): Promise<Response> => {
    const controller = new AbortController()
    const clientTimeout = setTimeout(() => {
        controller.abort()
    }, timeoutMs)

    try {
        const reqConfig: RequestInit = { ...init, signal: controller.signal }
        const res = await fetch(url, reqConfig)
        if (!res.ok) {
            const description = `${res.status}: ${url as string} traceID: ${res.headers.get('trace-id') ?? 'N/A'}`
            return await Promise.reject(new Error(description))
        }

        return res
    } catch (e: unknown) {
        if (e instanceof Error) {
            return await Promise.reject(new Error(`${e.name}: ${e.message}`))
        } else {
            return await Promise.reject(new Error('fetch failed with unknown error'))
        }
    } finally {
        clearTimeout(clientTimeout)
    }
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

const nowEpsilon = 3000 // 3 seconds

export const humanReadableTimeDiff = (time: Date): string => {
    const current = new Date()
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24

    const elapsed = current.getTime() - time.getTime()

    const { t } = useTranslation('', { keyPrefix: 'time' })

    if (Math.abs(elapsed) < nowEpsilon) {
        return t('now')
    }

    const postfix = t('separator') + (elapsed < 0 ? t('after') : t('before'))

    if (elapsed < msPerMinute) {
        return `${Math.round(Math.abs(elapsed) / 1000)}${t('seconds')}${postfix}`
    } else if (elapsed < msPerHour) {
        return `${Math.round(Math.abs(elapsed) / msPerMinute)}${t('minutes')}${postfix}`
    } else if (elapsed < msPerDay) {
        return `${Math.round(Math.abs(elapsed) / msPerHour)}${t('hours')}${postfix}`
    } else {
        return (
            (current.getFullYear() === time.getFullYear() ? '' : `${time.getFullYear()}-`) +
            `${String(time.getMonth() + 1).padStart(2, '0')}-` +
            `${String(time.getDate()).padStart(2, '0')} ` +
            `${String(time.getHours()).padStart(2, '0')}:` +
            `${String(time.getMinutes()).padStart(2, '0')}`
        )
    }
}

export const fileToBase64 = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result)
            } else {
                resolve(null)
            }
        }
    })
}

export const dumpRemarkPlugin = (): any => {
    return (tree: Node) => {
        console.log(inspect(tree))
    }
}

export const literalLinkRemarkPlugin = (): any => {
    return (tree: any) => {
        visit(tree, 'text', (node: any, index?: number, parent?: any) => {
            if (node.skip) return
            const parts = node.value.split(/(https?:\/\/[^\s]+)/)
            if (parts.length !== 1) {
                parent.children.splice(
                    index,
                    1,
                    ...parts
                        .map((part: string) => {
                            if (part.length === 0) return undefined
                            let uri = part
                            try {
                                uri = decodeURI(part)
                            } catch (_) {}
                            if (part.startsWith('http'))
                                return {
                                    type: 'link',
                                    url: part,
                                    title: part,
                                    children: [{ type: 'text', value: uri, skip: true }]
                                }
                            else return { type: 'text', value: part }
                        })
                        .filter((node: any) => node !== undefined)
                )
            }
        })
    }
}

export const strikeThroughRemarkPlugin = (): any => {
    return (tree: any) => {
        visit(tree, 'text', (node: any, index?: number, parent?: any) => {
            const parts = node.value.split(/(~~[^~]+~~)/)
            if (parts.length !== 1) {
                parent.children.splice(
                    index,
                    1,
                    ...parts
                        .map((part: string) => {
                            if (part.length === 0) return undefined
                            if (part.startsWith('~~'))
                                return { type: 'delete', children: [{ type: 'text', value: part.slice(2, -2) }] }
                            else return { type: 'text', value: part }
                        })
                        .filter((node: any) => node !== undefined)
                )
            }
        })
    }
}

export const userMentionRemarkPlugin = (): any => {
    return (tree: any) => {
        visit(tree, 'text', (node: any, index?: number, parent?: any) => {
            const parts = node.value.split(/(@CC\w+)/)
            if (parts.length !== 1) {
                parent.children.splice(
                    index,
                    1,
                    ...parts
                        .map((part: string) => {
                            if (part.length === 0) return undefined
                            if (part.startsWith('@')) return { type: 'userlink', ccid: part.slice(1) }
                            else return { type: 'text', value: part }
                        })
                        .filter((node: any) => node !== undefined)
                )
            }
        })
    }
}

export const streamLinkRemarkPlugin = (): any => {
    return (tree: any) => {
        visit(tree, 'text', (node: any, index?: number, parent?: any) => {
            const parts = node.value.split(/(#\w+@[^\s]+)/)
            if (parts.length !== 1) {
                parent.children.splice(
                    index,
                    1,
                    ...parts
                        .map((part: string) => {
                            if (part.length === 0) return undefined
                            if (part.startsWith('#')) return { type: 'streamlink', streamId: part.slice(1) }
                            else return { type: 'text', value: part }
                        })
                        .filter((node: any) => node !== undefined)
                )
            }
        })
    }
}

export const emojiRemarkPlugin = (): any => {
    return (tree: any) => {
        visit(tree, ['text', 'html'], (node: any, index?: number, parent?: any) => {
            const parts = node.value.split(/(:\w+:)/)
            if (parts.length !== 1) {
                parent.children.splice(
                    index,
                    1,
                    ...parts
                        .map((part: string) => {
                            if (part.length === 0) return undefined
                            if (part.startsWith(':')) return { type: 'emoji', shortcode: part.slice(1, -1) }
                            else return { type: node.type, value: part }
                        })
                        .filter((node: any) => node !== undefined)
                )
            }
        })
    }
}
