import type { Character, Message, Stream, StreamElement, Association, SignedObject } from '../model'
import { type Profile } from '../schemas/profile'

import { type Commonstream } from '../schemas/commonstream'
import { type SimpleNote } from '../schemas/simpleNote'

export const StreamMock = (streamName: string = 'MockStreamName'): Stream<Commonstream> => {
    return {
        id: 'streamid',
        author: 'author',
        maintainer: ['maintainer'],
        writer: ['writer'],
        reader: ['reader'],
        schema: 'schema',
        payload: {
            signer: 'signer',
            type: 'type',
            schema: 'schema',
            body: {
                name: streamName,
                banner: 'banner',
                description: 'description',
                icon: 'icon',
                shortname: 'shortname'
            },
            meta: 'meta',
            signedAt: 'signedAt',
            target: 'target'
        },
        signature: 'signature',
        cdate: 'cdate'
    }
}

export const MessageMock = (
    body: string = 'MockBody',
    author: string = 'MockAuthor',
    cdate: string = '2023-06-06T00:15:21.43756+09:00'
): Message<SimpleNote> => {
    return {
        associations: [],
        author,
        cdate,
        id: '2fb3df10-b8a6-4723-8f74-428b00b58314',
        payload: {
            signer: author,
            type: 'Message',
            schema: 'https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json%22,%22body%22:%7B%22body%22:%22aaa%22%7D,%22meta%22:%7B%22client%22:%22concurrent-web feat/reply-8b07125c456cc41a5621cf98836a5667b749f5e3',
            body: {
                body
            },
            meta: '',
            signedAt: '2023-06-05T15:15:21.308Z'
        },
        rawpayload:
            '{"signer":"CC3cb9f46c35d54b868dfAadc9eDb02B27Ec1d0652","type":"Message","schema":"https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json","body":{"body":"aaa"},"meta":{"client":"concurrent-web feat/reply-8b07125c456cc41a5621cf98836a5667b749f5e3"},"signedAt":"2023-06-05T15:15:21.308Z"}',
        schema: 'https://raw.githubusercontent.com/totegamma/concurrent-schemas/master/messages/note/0.0.1.json',
        signature:
            '5806a2506a0769e5c34de8ef77273c7c93070a295f172eead4040d5664aa67644b8707e4d13b9bed55983abf467d51e2bea0e16c7a3149f628ccc0fbaa90cc7800',
        streams: ['chtmidue6sjm9s85nlfg@kokoa.kokopi.me', 'chuv3tiftt0ebu48k480@kokoa.kokopi.me']
    }
}
export const CharacterProfileMock = (username: string): Character<Profile> => {
    return {
        associations: [],
        author: 'author',
        schema: 'schema',
        id: 'id',
        payload: {
            signer: 'signer',
            type: 'type',
            schema: 'schema',
            body: {
                username,
                avatar: 'avatar',
                description: 'description',
                banner: 'banner'
            },
            meta: 'meta',
            signedAt: 'signedAt',
            target: 'target'
        },
        signature: 'signature',
        cdate: 'cdate'
    }
}

export const StreamElementMock: StreamElement = {
    timestamp: 'timestamp',
    id: 'id',
    type: 'type',
    author: 'author',
    currenthost: 'currenthost'
}
