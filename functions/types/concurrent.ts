export interface AddressResponse {
    content: {
        payload: string
    }
}

export interface CharactersResponse {
    content: {
        payload: string
    }[]
}

export interface Characters {
    username: string
    description: string
    avatar: string
    banner: string
    subprofiles: string
}

export interface MessageResponse {
    content: {
        payload: string
    }
}

export interface Message {
    body: string
    emojis: {}
    mentions: []
    profileOverride: {}
}

export interface CharactersResponse {
    content: {
        payload: string
    }[]
}

export interface Characters {
    username: string
    description: string
    avatar: string
    banner: string
    subprofiles: string
}

export interface Stream {
    name: string
    shortname: string
    description: string
    banner: string
}
