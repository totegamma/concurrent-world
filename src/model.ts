
export interface RTMMessage {
    id: string;
    cdate: string;
    author: string;
    payload: string;
    signature: string;
}

export interface User {
    pubkey: string;
    username: string;
    avatar: string;
    description: string;
}

