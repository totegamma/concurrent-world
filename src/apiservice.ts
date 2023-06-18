import type {
    Stream,
    MessagePostRequest,
    SignedObject,
    Character,
    Host,
    StreamElement,
    Message,
    Entity,
    Association
} from './model'
import { v4 as uuidv4 } from 'uuid'
// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
import { Sign, SignJWT, fetchWithTimeout } from './util'
import { Schemas } from './schemas'
import { type Userstreams } from './schemas/userstreams'

const branchName = branch || window.location.host.split('.')[0]

const apiPath = '/api/v1'

export default class ConcurrentApiClient {
    host: Host | undefined
    userAddress: string
    privatekey: string
    token?: string

    entityCache: Record<string, Promise<Entity> | undefined> = {}
    messageCache: Record<string, Promise<Message<any>> | undefined> = {}
    characterCache: Record<string, Promise<Character<any>> | undefined> = {}
    associationCache: Record<string, Promise<Association<any>> | undefined> = {}
    streamCache: Record<string, Promise<Stream<any>> | undefined> = {}

    constructor(userAddress: string, privatekey: string, host?: Host) {
        this.host = host
        this.userAddress = userAddress
        this.privatekey = privatekey
        console.log('oOoOoOoOoO API SERVICE CREATED OoOoOoOoOo')
    }

    async getJWT(): Promise<string> {
        console.log('request token!')
        if (!this.host) throw new Error()
        const requestJwt = this.constructJWT({})
        const requestOptions = {
            method: 'GET',
            headers: { authentication: requestJwt }
        }
        return await fetchWithTimeout(`https://${this.host.fqdn}${apiPath}/auth/claim`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                this.token = data.jwt
                return data.jwt
            })
    }

    checkJwtIsValid(jwt: string): boolean {
        const split = jwt.split('.')
        if (split.length !== 3) return false
        const encoded = split[1]
        const payload = window.atob(
            encoded.replace('-', '+').replace('_', '/') + '=='.slice((2 - encoded.length * 3) & 3)
        )
        try {
            const claims = JSON.parse(payload)
            const nbf = parseInt(claims.nbf)
            const exp = parseInt(claims.exp)
            const now = Math.floor(new Date().getTime() / 1000)

            return nbf < now && now < exp
        } catch (e) {
            console.log(e)
        }
        return false
    }

    fetchWithCredential = async (url: RequestInfo, init: RequestInit, timeoutMs?: number): Promise<Response> => {
        let jwt = this.token
        if (!jwt || !this.checkJwtIsValid(jwt)) {
            jwt = await this.getJWT()
        }
        const requestInit = {
            ...init,
            headers: {
                ...init.headers,
                authentication: 'Bearer ' + jwt
            }
        }
        return await fetchWithTimeout(url, requestInit, timeoutMs)
    }

    // Message
    async createMessage<T>(schema: string, body: T, streams: string[]): Promise<any> {
        if (!this.host) throw new Error()
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Message',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${sha as string}`
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

        const res = await this.fetchWithCredential(`https://${this.host.fqdn}${apiPath}/messages`, requestOptions)

        return await res.json()
    }

    async fetchMessage(id: string, host: string = ''): Promise<Message<any> | undefined> {
        if (!this.host) throw new Error()
        if (this.messageCache[id]) {
            return await this.messageCache[id]
        }
        const messageHost = !host ? this.host.fqdn : host
        this.messageCache[id] = fetch(`https://${messageHost}${apiPath}/messages/${id}`, {
            method: 'GET',
            headers: {}
        }).then(async (res) => {
            if (!res.ok) {
                return await Promise.reject(new Error(`fetch failed: ${res.status} ${await res.text()}`))
            }
            const data = await res.json()
            if (!data.payload) {
                return undefined
            }
            const message = data
            message.rawpayload = message.payload
            message.payload = JSON.parse(message.payload)
            return message
        })
        return await this.messageCache[id]
    }

    async deleteMessage(target: string, host: string = ''): Promise<any> {
        if (!this.host) throw new Error()
        const targetHost = !host ? this.host.fqdn : host
        const requestOptions = {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                id: target
            })
        }

        return await this.fetchWithCredential(`https://${targetHost}${apiPath}/messages`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    invalidateMessage(target: string): void {
        delete this.messageCache[target]
    }

    // Association
    async createAssociation<T>(
        schema: string,
        body: T,
        target: string,
        targetType: string,
        streams: string[],
        host: string = ''
    ): Promise<any> {
        if (!this.host) throw new Error()
        const targetHost = !host ? this.host.fqdn : host
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Association',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${sha as string}`
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

        return await this.fetchWithCredential(`https://${targetHost}${apiPath}/associations`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async deleteAssociation(target: string, host: string = ''): Promise<any> {
        if (!this.host) throw new Error()
        const targetHost = !host ? this.host.fqdn : host
        const requestOptions = {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                id: target
            })
        }

        return await this.fetchWithCredential(`https://${targetHost}${apiPath}/associations`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async fetchAssociation(id: string, host: string = ''): Promise<Association<any> | undefined> {
        if (!this.host) throw new Error()
        if (this.associationCache[id]) {
            return await this.associationCache[id]
        }
        const associationHost = !host ? this.host.fqdn : host
        this.associationCache[id] = fetch(`https://${associationHost}${apiPath}/associations/${id}`, {
            method: 'GET',
            headers: {}
        }).then(async (res) => {
            if (!res.ok) {
                return await Promise.reject(new Error(`fetch failed: ${res.status} ${await res.text()}`))
            }
            const data = await res.json()
            if (!data.association) {
                return undefined
            }
            const association = data.association
            association.rawpayload = association.payload
            association.payload = JSON.parse(association.payload)
            this.associationCache[id] = association
            return association
        })
        return await this.associationCache[id]
    }

    // Character
    async upsertCharacter<T>(schema: string, body: T, id?: string): Promise<any> {
        if (!this.host) throw new Error()
        const signObject: SignedObject<T> = {
            signer: this.userAddress,
            type: 'Character',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${sha as string}`
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

        return await this.fetchWithCredential(`https://${this.host.fqdn}${apiPath}/characters`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async readCharacter(author: string, schema: string, host: string = ''): Promise<Character<any> | undefined> {
        if (!this.host || !author) throw new Error()
        if (this.characterCache[author + schema]) {
            return await this.characterCache[author + schema]
        }
        let characterHost = host
        if (characterHost === '') {
            const entity = await this.readEntity(author)
            characterHost = entity?.host ?? this.host.fqdn
            if (!characterHost || characterHost === '') characterHost = this.host.fqdn
        }
        this.characterCache[author + schema] = fetch(
            `https://${characterHost}${apiPath}/characters?author=${author}&schema=${encodeURIComponent(schema)}`,
            {
                method: 'GET',
                headers: {}
            }
        ).then(async (res) => {
            const data = await res.json()
            if (data.characters.length === 0) {
                return undefined
            }
            const character = data.characters[0]
            character.payload = JSON.parse(character.payload)
            this.characterCache[author + schema] = character
            return character
        })
        return await this.characterCache[author + schema]
    }

    // Stream
    async createStream<T>(schema: string, body: T): Promise<any> {
        if (!this.host) throw new Error()
        const signObject = {
            signer: this.userAddress,
            type: 'Stream',
            schema,
            body,
            meta: {
                client: `concurrent-web ${branchName as string}-${sha as string}`
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

        return await this.fetchWithCredential(`https://${this.host.fqdn}${apiPath}/stream`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async updateStream(id: string, partialSignObject: any): Promise<any> {
        if (!this.host) throw new Error()

        const signObject = {
            ...partialSignObject,
            signer: this.userAddress,
            type: 'Stream',
            meta: {
                client: `concurrent-web ${branchName as string}-${sha as string}`
            },
            signedAt: new Date().toISOString()
        }

        const signedObject = JSON.stringify(signObject)
        const signature = Sign(this.privatekey, signedObject)

        const requestOptions = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                id,
                signedObject,
                signature
            })
        }

        return await this.fetchWithCredential(`https://${this.host.fqdn}${apiPath}/stream`, requestOptions)
            .then(async (res) => await res.json())
            .then((data) => {
                return data
            })
    }

    async getStreamListBySchema(schema: string, remote?: string): Promise<Array<Stream<any>>> {
        if (!this.host) throw new Error()
        return await fetch(`https://${remote ?? this.host.fqdn}${apiPath}/stream/list?schema=${schema}`).then(
            async (data) => {
                return await data.json().then((arr) => {
                    return arr.map((e: any) => {
                        return { ...e, payload: JSON.parse(e.payload) }
                    })
                })
            }
        )
    }

    async readStream(id: string): Promise<Stream<any> | undefined> {
        if (!this.host) throw new Error()
        if (this.streamCache[id]) {
            return await this.streamCache[id]
        }
        const key = id.split('@')[0]
        const host = id.split('@')[1] ?? this.host.fqdn
        this.streamCache[id] = fetch(`https://${host}${apiPath}/stream?stream=${key}`, {
            method: 'GET',
            headers: {}
        }).then(async (res) => {
            if (!res.ok) {
                return await Promise.reject(new Error(`fetch failed: ${res.status} ${await res.text()}`))
            }
            const data = await res.json()
            if (!data.payload) {
                return undefined
            }
            const stream = data
            stream.id = id
            stream.payload = JSON.parse(stream.payload)
            this.streamCache[id] = stream
            return stream
        })
        return await this.streamCache[id]
    }

    async readStreamRecent(streams: string[]): Promise<StreamElement[]> {
        if (!this.host) throw new Error()
        const plan: Record<string, string[]> = {}
        for (const stream of streams) {
            const id = stream.split('@')[0]
            const host = stream.split('@')[1] ?? this.host.fqdn
            plan[host] = [...(plan[host] ? plan[host] : []), id]
        }

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
                `https://${host}${apiPath}/stream/recent?streams=${plan[host].join(',')}`,
                requestOptions
            ).then(async (res) => await res.json())
            result = [...result, ...response]
        }
        return result
    }

    async readStreamRanged(streams: string[], until?: string, since?: string): Promise<StreamElement[]> {
        if (!this.host) throw new Error()
        const plan: Record<string, string[]> = {}
        for (const stream of streams) {
            const id = stream.split('@')[0]
            const host = stream.split('@')[1] ?? this.host.fqdn
            plan[host] = [...(plan[host] ? plan[host] : []), id]
        }

        const requestOptions = {
            method: 'GET',
            headers: {}
        }

        const sinceQuery = !since ? '' : `&since=${since}`
        const untilQuery = !until ? '' : `&until=${until}`

        let result: StreamElement[] = []
        for (const host of Object.keys(plan)) {
            if (!host) {
                console.warn('invalid query')
                continue
            }
            const response = await fetch(
                `https://${host}${apiPath}/stream/range?streams=${plan[host].join(',')}${sinceQuery}${untilQuery}`,
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
        return await fetch(`https://${fqdn}${apiPath}/host`).then(async (data) => {
            return await data.json()
        })
    }

    async getKnownHosts(remote?: string): Promise<Host[]> {
        if (!this.host) throw new Error()
        return await fetch(`https://${remote ?? this.host.fqdn}${apiPath}/host/list`).then(async (data) => {
            return await data.json()
        })
    }

    // Entity
    async readEntity(ccaddr: string): Promise<Entity | undefined> {
        if (!this.host) throw new Error()
        if (this.entityCache[ccaddr]) {
            return await this.entityCache[ccaddr]
        }
        this.entityCache[ccaddr] = fetch(`https://${this.host.fqdn}${apiPath}/entity/${ccaddr}`, {
            method: 'GET',
            headers: {}
        }).then(async (res) => {
            const entity = await res.json()
            if (!entity || entity.ccaddr === '') {
                return undefined
            }
            this.entityCache[ccaddr] = entity
            return entity
        })
        return await this.entityCache[ccaddr]
    }

    // Utils

    async getUserHomeStreams(users: string[]): Promise<string[]> {
        return (
            await Promise.all(
                users.map(async (ccaddress: string) => {
                    const entity = await this.readEntity(ccaddress)
                    const character: Character<Userstreams> | undefined = await this.readCharacter(
                        ccaddress,
                        Schemas.userstreams,
                        entity?.host
                    )

                    if (!character?.payload.body.homeStream) return undefined

                    let streamID: string = character.payload.body.homeStream
                    if (entity?.host && entity.host !== '') {
                        streamID += `@${entity.host}`
                    }
                    return streamID
                })
            )
        ).filter((e) => e) as string[]
    }

    async setupUserstreams(): Promise<void> {
        const userstreams = await this.readCharacter(this.userAddress, Schemas.userstreams)
        const id = userstreams?.id
        const res0 = await this.createStream(Schemas.utilitystream, {})
        const homeStream = res0.id
        console.log('home', homeStream)

        const res1 = await this.createStream(Schemas.utilitystream, {})
        const notificationStream = res1.id
        console.log('notification', notificationStream)

        const res2 = await this.createStream(Schemas.utilitystream, {})
        const associationStream = res2.id
        console.log('notification', associationStream)

        this.upsertCharacter<Userstreams>(
            Schemas.userstreams,
            {
                homeStream,
                notificationStream,
                associationStream
            },
            id
        ).then((data) => {
            console.log(data)
        })
    }

    constructJWT(claim: Record<string, string>): string {
        const payload = JSON.stringify({
            jti: uuidv4(),
            iss: this.userAddress,
            iat: Math.floor(new Date().getTime() / 1000).toString(),
            aud: this.host?.fqdn,
            nbf: Math.floor((new Date().getTime() - 5 * 60 * 1000) / 1000).toString(),
            exp: Math.floor((new Date().getTime() + 5 * 60 * 1000) / 1000).toString(),
            ...claim
        })
        return SignJWT(payload, this.privatekey)
    }
}
