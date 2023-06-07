import { ApiService } from '../abstraction/apiservice'
import type { Association, Character, Entity, Host, Message, Stream, StreamElement } from '../model'
import { StreamMock } from './modelmock'

export class ApiMock extends ApiService {
    host: Host | undefined
    userAddress: string
    privatekey: string
    token?: string

    associationCache: Record<string, Promise<Association<any>> | undefined>
    characterCache: Record<string, Promise<Character<any>> | undefined>
    entityCache: Record<string, Promise<Entity> | undefined>
    messageCache: Record<string, Promise<Message<any>> | undefined>
    streamCache: Record<string, Promise<Stream<any>> | undefined>

    constructor() {
        super()
        this.associationCache = {}
        this.characterCache = {}
        this.entityCache = {}
        this.messageCache = {}
        this.streamCache = {}
        this.userAddress = 'CCuserAddress'
        this.privatekey = 'private-key'
        this.token = 'token'
    }

    checkJwtIsValid(jwt: string): boolean {
        return false
    }

    constructJWT(claim: Record<string, string>): string {
        return ''
    }

    createAssociation<T>(
        schema: string,
        body: T,
        target: string,
        targetType: string,
        streams: string[],
        host: string
    ): Promise<any> {
        return Promise.resolve(undefined)
    }

    createMessage<T>(schema: string, body: T, streams: string[]): Promise<any> {
        return Promise.resolve(undefined)
    }

    createStream<T>(schema: string, body: T): Promise<any> {
        return Promise.resolve(undefined)
    }

    deleteAssociation(target: string, host: string): Promise<any> {
        return Promise.resolve(undefined)
    }

    deleteMessage(target: string, host: string): Promise<any> {
        return Promise.resolve(undefined)
    }

    fetchAssociation(id: string, host: string): Promise<Association<any> | undefined> {
        return Promise.resolve(undefined)
    }

    fetchMessage(id: string, host: string): Promise<Message<any> | undefined> {
        return Promise.resolve(undefined)
    }

    fetchWithCredential(url: RequestInfo, init: RequestInit, timeoutMs?: number): Promise<Response> {
        const response = new Response()
        return Promise.resolve(response)
    }

    getHostProfile(remote?: string): Promise<Host> {
        const host: Host = {
            fqdn: '',
            ccaddr: '',
            role: '',
            pubkey: '',
            cdate: new Date()
        }
        return Promise.resolve(host)
    }

    getJWT(): Promise<string> {
        return Promise.resolve('')
    }

    getKnownHosts(remote?: string): Promise<Host[]> {
        return Promise.resolve([])
    }

    getStreamListBySchema(schema: string, remote?: string): Promise<Array<Stream<any>>> {
        return Promise.resolve([StreamMock])
    }

    getUserHomeStreams(users: string[]): Promise<string[]> {
        return Promise.resolve([])
    }

    invalidateMessage(target: string): void {}

    readCharacter(author: string, schema: string, host: string): Promise<Character<any> | undefined> {
        return Promise.resolve(undefined)
    }

    readEntity(ccaddr: string): Promise<Entity | undefined> {
        return Promise.resolve(undefined)
    }

    readStream(id: string): Promise<Stream<any> | undefined> {
        return Promise.resolve(undefined)
    }

    readStreamRanged(streams: string[], until?: string, since?: string): Promise<StreamElement[]> {
        return Promise.resolve([])
    }

    readStreamRecent(streams: string[]): Promise<StreamElement[]> {
        return Promise.resolve([])
    }

    setupUserstreams(): Promise<void> {
        return Promise.resolve(undefined)
    }

    updateStream(id: string, partialSignObject: any): Promise<any> {
        return Promise.resolve(undefined)
    }

    upsertCharacter<T>(schema: string, body: T, id?: string): Promise<any> {
        return Promise.resolve(undefined)
    }
}
