import { Mnemonic, randomBytes, HDNodeWallet } from 'ethers'
import { LangJa } from './utils/lang-ja'

interface identity {
    mnemonic: string
    privateKey: string
    publicKey: string
    CCID: string
}

export const generateIdentity = (): identity => {
    const entrophy = randomBytes(16)
    const mnemonic = Mnemonic.fromEntropy(entrophy, null, LangJa.wordlist())
    const wallet = HDNodeWallet.fromPhrase(mnemonic.phrase, undefined, undefined, LangJa.wordlist())
    const CCID = 'CC' + wallet.address.slice(2)
    const privateKey = wallet.privateKey.slice(2)
    const publicKey = wallet.publicKey.slice(2)

    return {
        mnemonic: mnemonic.phrase,
        privateKey,
        publicKey,
        CCID
    }
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

export const isValid256k1PrivateKey = (key: string): boolean => {
    if (!/^[0-9a-f]{64}$/i.test(key)) return false
    const privateKey = BigInt(`0x${key}`)
    const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141')
    return privateKey > BigInt(0) && privateKey < n
}

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export const humanReadableTimeDiff = (time: Date): string => {
    const current = new Date()
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24

    const elapsed = current.getTime() - time.getTime()

    if (elapsed < msPerMinute) {
        return `${Math.round(elapsed / 1000)}秒前`
    } else if (elapsed < msPerHour) {
        return `${Math.round(elapsed / msPerMinute)}分前`
    } else if (elapsed < msPerDay) {
        return `${Math.round(elapsed / msPerHour)}時間前`
    } else {
        return (
            (current.getFullYear() === time.getFullYear() ? '' : `${time.getFullYear()}年 `) +
            `${String(time.getMonth() + 1).padStart(2, '0')}月` +
            `${String(time.getDate()).padStart(2, '0')}日 ` +
            `${String(time.getHours()).padStart(2, '0')}時` +
            `${String(time.getMinutes()).padStart(2, '0')}分`
        )
    }
}
