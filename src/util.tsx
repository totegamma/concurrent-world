import { ec } from 'elliptic';
import { keccak256, computeAddress } from 'ethers';

export const Sign = (privatekey: string, payload: string) => {
    const ellipsis = new ec("secp256k1")
    const keyPair = ellipsis.keyFromPrivate(privatekey)
    const messageHash = keccak256(new TextEncoder().encode(payload)).slice(2)
    const signature = keyPair.sign(messageHash, 'hex', {canonical: true})
    console.log(signature)
    const r = toHexString(signature.r.toArray())
    const s = toHexString(signature.s.toArray())
    const v = signature.recoveryParam == 0 ? '00' : '01'
    return r + s + v
}

export const Keygen = (): key => {
    const ellipsis = new ec("secp256k1")
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

function toHexString(byteArray: Uint8Array | number[]) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

interface key {
    privatekey: string
    publickey: string
    ccaddress: string
}
