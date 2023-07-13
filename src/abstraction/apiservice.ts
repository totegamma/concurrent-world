import type { Association, CCID, Character, Entity, Host, Message, Stream, StreamElement } from '../model'

export abstract class ApiService {
    abstract host: string | undefined
    abstract userAddress: string
    abstract privatekey: string
    abstract token?: string

    abstract entityCache: Record<string, Promise<Entity> | undefined>
    abstract messageCache: Record<string, Promise<Message<any>> | undefined>
    abstract characterCache: Record<string, Promise<Character<any>> | undefined>
    abstract associationCache: Record<string, Promise<Association<any>> | undefined>
    abstract streamCache: Record<string, Promise<Stream<any>> | undefined>

    abstract getJWT(): Promise<string>
    abstract checkJwtIsValid(jwt: string): boolean
    abstract fetchWithCredential(url: RequestInfo, init: RequestInit, timeoutMs?: number): Promise<Response>
    abstract createMessage<T>(schema: string, body: T, streams: string[]): Promise<any>
    abstract fetchMessage(id: string, host: string): Promise<Message<any> | undefined>
    abstract deleteMessage(target: string, host: string): Promise<any>
    abstract invalidateMessage(target: string): void
    abstract createAssociation<T>(
        schema: string,
        body: T,
        target: string,
        targetAuthor: string,
        targetType: string,
        streams: string[]
    ): Promise<any>
    abstract deleteAssociation(target: string, host: string): Promise<any>
    abstract fetchAssociation(id: string, host: string): Promise<Association<any> | undefined>
    abstract upsertCharacter<T>(schema: string, body: T, id?: string): Promise<any>
    abstract readCharacter(author: string, schema: string, host: string): Promise<Character<any> | undefined>
    abstract createStream<T>(
        schema: string,
        body: T,
        { maintainer = [], writer = [], reader = [] }: { maintainer?: CCID[]; writer?: CCID[]; reader?: CCID[] }
    ): Promise<any>
    abstract updateStream(id: string, partialSignObject: any): Promise<any>
    abstract getStreamListBySchema(schema: string, remote?: string): Promise<Array<Stream<any>>>
    abstract readStream(id: string): Promise<Stream<any> | undefined>
    abstract readStreamRecent(streams: string[]): Promise<StreamElement[]>
    abstract readStreamRanged(streams: string[], until?: string, since?: string): Promise<StreamElement[]>
    abstract getHostProfile(remote?: string): Promise<Host>
    abstract getKnownHosts(remote?: string): Promise<Host[]>
    abstract readEntity(ccaddr: string): Promise<Entity | undefined>
    abstract getUserHomeStreams(users: string[]): Promise<string[]>
    abstract setupUserstreams(): Promise<void>
    abstract constructJWT(claim: Record<string, string>): string
}
