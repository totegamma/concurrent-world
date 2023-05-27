import { ec as Ec } from 'elliptic'
import { keccak256, computeAddress } from 'ethers'

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
    return body + '.' + byteToBase64Url([...signature.r.toArray(), ...signature.s.toArray(), signature.recoveryParam!])
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
    console.log(keyPair)
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

const byteToBase64Url = (byte: number[]): string => {
    const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    const bytes = new Uint8Array(byte)
    let newBase64 = ''
    let currentChar = 0
    for (let i = 0; i < bytes.length; i++) {
        // Go over three 8-bit bytes to encode four base64 6-bit chars
        if (i % 3 === 0) {
            // First Byte
            currentChar = bytes[i] >> 2 // First 6-bits for first base64 char
            newBase64 += key[currentChar] // Add the first base64 char to the string
            currentChar = (bytes[i] << 4) & 63 // Erase first 6-bits, add first 2 bits for second base64 char
        }
        if (i % 3 === 1) {
            // Second Byte
            currentChar += bytes[i] >> 4 // Concat first 4-bits from second byte for second base64 char
            newBase64 += key[currentChar] // Add the second base64 char to the string
            currentChar = (bytes[i] << 2) & 63 // Add two zeros, add 4-bits from second half of second byte
        }
        if (i % 3 === 2) {
            // Third Byte
            currentChar += bytes[i] >> 6 // Concat first 2-bits of third byte for the third base64 char
            newBase64 += key[currentChar] // Add the third base64 char to the string
            currentChar = bytes[i] & 63 // Add last 6-bits from third byte for the fourth base64 char
            newBase64 += key[currentChar] // Add the fourth base64 char to the string
        }
    }
    return newBase64
}
