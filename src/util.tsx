import { ec as Ec } from 'elliptic'
import { keccak256, computeAddress } from 'ethers'

export const Sign = (privatekey: string, payload: string): string => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privatekey)
    const messageHash = keccak256(new TextEncoder().encode(payload)).slice(2)
    const signature = keyPair.sign(messageHash, 'hex', { canonical: true })
    console.log(signature)
    const r = toHexString(signature.r.toArray())
    const s = toHexString(signature.s.toArray())
    const v = signature.recoveryParam === 0 ? '00' : '01'
    return r + s + v
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

export const LoadKey = (privateKey: string): key => {
    const ellipsis = new Ec('secp256k1')
    const keyPair = ellipsis.keyFromPrivate(privateKey)
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
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365

    const elapsed = current.getTime() - time.getTime()

    if (elapsed < msPerMinute) {
        return `${Math.round(elapsed / 1000)}秒前`
    } else if (elapsed < msPerHour) {
        return `${Math.round(elapsed / msPerMinute)}分前`
    } else if (elapsed < msPerDay) {
        return `${Math.round(elapsed / msPerHour)}時間前`
    } else if (elapsed < msPerMonth) {
        return `${Math.round(elapsed / msPerDay)}日前`
    } else if (elapsed < msPerYear) {
        return `${Math.round(elapsed / msPerMonth)}ヶ月前`
    } else {
        return `${Math.round(elapsed / msPerYear)}年前'`
    }
}
