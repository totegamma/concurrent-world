import { ec as Ec } from 'elliptic'
import { keccak256, computeAddress, recoverAddress, toUtf8Bytes } from 'ethers'

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
            const description = `status code:${res.status}`
            console.error(description)
        }

        return res
    } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error()
        } else {
            throw new Error()
        }
    } finally {
        clearTimeout(clientTimeout)
    }
}

export const validateSignature = (body: string, signature: string, expectedAuthor: string): boolean => {
    const messageHash = keccak256(new TextEncoder().encode(body))
    const recovered = recoverAddress(messageHash, '0x' + signature)
    return recovered.slice(2) === expectedAuthor.slice(2)
}

export const Sign = (privatekey: string, payload: string): string => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privatekey)
    const messageHash = keccak256(new TextEncoder().encode(payload)).slice(2)
    const signature = keyPair.sign(messageHash, 'hex', { canonical: true })
    const r = toHexString(signature.r.toArray())
    const s = toHexString(signature.s.toArray())
    const v = signature.recoveryParam === 0 ? '00' : '01'
    return r + s + v
}

const makeUrlSafe = (input: string): string => {
    return input.replaceAll('=', '').replaceAll('+', '-').replaceAll('/', '_')
}

export const SignJWT = (payload: string, privatekey: string): string => {
    const header = JSON.stringify({ alg: 'ECRECOVER', typ: 'JWT' })
    const body = makeUrlSafe(window.btoa(header) + '.' + window.btoa(payload))
    const bodyHash = keccak256(new TextEncoder().encode(body)).slice(2)
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privatekey)
    const signature = keyPair.sign(bodyHash, 'hex', { canonical: true })
    const base64 = makeUrlSafe(
        window.btoa(
            String.fromCharCode.apply(null, [
                ...signature.r.toArray(),
                ...signature.s.toArray(),
                signature.recoveryParam ?? 0
            ])
        )
    )
    return body + '.' + base64
}

export const Keygen = (): key => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.genKeyPair()
    const privatekey = keyPair.getPrivate().toString('hex')
    const publickey = keyPair.getPublic().encode('hex', false)
    const ethAddress = computeAddress('0x' + publickey)
    const ccaddress = 'CC' + ethAddress.slice(2)
    return {
        privatekey,
        publickey,
        ccaddress
    }
}

export const LoadKey = (privateKey: string): key | null => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privateKey)
    if (!keyPair.getPrivate()) return null
    const privatekey = keyPair.getPrivate().toString('hex')
    const publickey = keyPair.getPublic().encode('hex', false)
    const ethAddress = computeAddress('0x' + publickey)
    const ccaddress = 'CC' + ethAddress.slice(2)
    return {
        privatekey,
        publickey,
        ccaddress
    }
}

function toHexString(byteArray: Uint8Array | number[]): string {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
}

interface key {
    privatekey: string
    publickey: string
    ccaddress: string
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
