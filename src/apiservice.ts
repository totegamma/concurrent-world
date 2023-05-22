import type {
    Stream,
    MessagePostRequest,
    SignedObject,
    Character,
    Host,
    StreamElement
} from './model'

// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
import { Sign } from './util'
const branchName = branch || window.location.host.split('.')[0]

export default class ConcurrentApiClient {
    host: Host | undefined
    userAddress: string
    privatekey: string

    characterCache: Record<string, Character<any>> = {}
    streamCache: Record<string, Stream<any>> = {}

    constructor(userAddress: string, privatekey: string, host?: Host) {
        this.host = host
        this.userAddress = userAddress
        this.privatekey = privatekey
        console.log('oOoOoOoOoO API SERVICE CREATED OoOoOoOoOo')
    }

    // Message
    async createMessage<T>(
        schema: string,
        body: T,
        streams: string[]
    ): Promise<any> {
        if (!this.host) throw new Error()
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Message',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${
                    sha as string
                }`
            },
            signedAt: new Date().toISOString()
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(this.privatekey, signedObject)

        const request: MessagePostRequest = {
            signedObject,
            signature,
            streams
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request)
        }

        return await fetch(`https://${this.host.fqdn}/messages`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    // Association
    async createAssociation<T>(
        schema: string,
        body: T,
        target: string,
        targetType: string,
        streams: string[]
    ): Promise<any> {
        if (!this.host) throw new Error()
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Association',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${
                    sha as string
                }`
            },
            signedAt: new Date().toISOString(),
            target
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(this.privatekey, signedObject)

        const requestOptions = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                targetType,
                signedObject,
                signature,
                streams
            })
        }

        return await fetch(
            `https://${this.host.fqdn}/associations`,
            requestOptions
        )
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async deleteAssociation(target: string): Promise<any> {
        if (!this.host) throw new Error()
        const requestOptions = {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                id: target
            })
        }

        return await fetch(
            `https://${this.host.fqdn}/associations`,
            requestOptions
        )
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    // Character
    async upsertCharacter<T>(
        schema: string,
        body: T,
        id?: string
    ): Promise<any> {
        if (!this.host) throw new Error()
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Character',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${
                    sha as string
                }`
            },
            signedAt: new Date().toISOString()
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(this.privatekey, signedObject)

        const request = {
            signedObject,
            signature,
            id
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request)
        }

        return await fetch(
            `https://${this.host.fqdn}/characters`,
            requestOptions
        )
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async readCharacter(
        author: string,
        schema: string
    ): Promise<Character<any> | undefined> {
        if (!this.host) throw new Error()
        if (this.characterCache[author + schema]) {
            return this.characterCache[author + schema]
        }
        const res = await fetch(
            `https://${
                this.host.fqdn
            }/characters?author=${author}&schema=${encodeURIComponent(schema)}`,
            {
                method: 'GET',
                headers: {}
            }
        )
        const data = await res.json()
        if (data.characters.length === 0) {
            return undefined
        }
        const character = data.characters[0]
        character.payload = JSON.parse(character.payload)
        this.characterCache[author + schema] = character
        return character
    }

    // Stream
    async createStream(schema: string, body: any): Promise<any> {
        if (!this.host) throw new Error()
        const signObject = {
            signer: this.userAddress,
            type: 'Stream',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${
                    sha as string
                }`
            },
            signedAt: new Date().toISOString(),
            maintainer: [],
            writer: [],
            reader: []
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(this.privatekey, signedObject)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                signedObject,
                signature
            })
        }

        return await fetch(`https://${this.host.fqdn}/stream`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async getStreamListBySchema(
        schema: string,
        remote?: string
    ): Promise<Array<Stream<any>>> {
        if (!this.host) throw new Error()
        return await fetch(
            `https://${remote ?? this.host.fqdn}/stream/list?schema=${schema}`
        ).then(async (data) => {
            return await data.json().then((arr) => {
                return arr.map((e: any) => {
                    return { ...e, payload: JSON.parse(e.payload) }
                })
            })
        })
    }

    async readStream(id: string): Promise<Stream<any> | undefined> {
        if (!this.host) throw new Error()
        if (this.streamCache[id]) {
            return this.streamCache[id]
        }
        const key = id.split('@')[0]
        const host = id.split('@')[1]
        const res = await fetch(`https://${host}/stream?stream=${key}`, {
            method: 'GET',
            headers: {}
        })
        const data = await res.json()
        if (!data.payload) {
            return undefined
        }
        const stream = data
        stream.id = id
        stream.payload = JSON.parse(stream.payload)
        this.characterCache[id] = stream
        return stream
    }

    async readStreamRecent(streams: string[]): Promise<StreamElement[]> {
        if (!this.host) throw new Error()
        const plan: Record<string, string[]> = {}
        for (const stream of streams) {
            const id = stream.split('@')[0]
            const host = stream.split('@')[1] ?? this.host.fqdn
            plan[host] = [...(plan[host] ? plan[host] : []), id]
        }
        console.log(plan)

        const requestOptions = {
            method: 'GET',
            headers: {}
        }

        let result: StreamElement[] = []
        for (const host of Object.keys(plan)) {
            if (!host) {
                console.warn('invalid query')
                continue
            }
            const response = await fetch(
                `https://${host}/stream/recent?streams=${plan[host].join(',')}`,
                requestOptions
            ).then(async (res) => await res.json())
            result = [...result, ...response]
        }
        return result
    }

    // Host
    async getHostProfile(remote?: string): Promise<Host> {
        const fqdn = remote ?? this.host?.fqdn
        if (!fqdn) throw new Error()
        return await fetch(`https://${fqdn}/host`).then(async (data) => {
            return await data.json()
        })
    }

    async getKnownHosts(remote?: string): Promise<Host[]> {
        if (!this.host) throw new Error()
        return await fetch(
            `https://${remote ?? this.host.fqdn}/host/list`
        ).then(async (data) => {
            return await data.json()
        })
    }
}
