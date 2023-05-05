export interface StreamElement {
    ID: string
    Values: {
        id: string
    }
}

export interface Association {
    author: string
    cdate: string
    id: string
    payload: string
    schema: string
    signature: string
    target: string
}

export interface RTMMessage {
    associations: string
    associations_data: Association[]
    author: string
    cdate: string
    id: string
    payload: string
    schema: string
    signature: string
    streams: string
}

export interface User {
    pubkey: string
    username: string
    avatar: string
    description: string
    homestream: string
    notificationstream: string
}

export interface ServerEvent {
    type: string
    action: string
    body: RTMMessage | Association
}

export interface Emoji {
    publicUrl: string
}
