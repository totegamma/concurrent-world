
export interface RTMMessage {
    id: string;
    cdate: string;
    author: string;
    payload: string;
    r: string;
    s: string;
}

export interface User {
    pubkey: string;
    username: string;
    avatar: string;
    description: string;
}

