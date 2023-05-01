import { useRef } from 'react';


export interface IuseResourceManager<T> {
    current: {[key: string]: T};
    get: (key: string) => Promise<T>;
    register: (key: string, value:T) => void;
    invalidate: (key: string) => void;
}


export function useResourceManager<T>(resolver: (key: string) => Promise<T>): IuseResourceManager<T> {

    const body = useRef<{[key: string]: T}>({});

    const get = async (key: string): Promise<T> => {
        if (!(key in body.current)) {
            body.current[key] = await resolver(key);
        }
        return body.current[key];
    }

    const register = (key: string, value: T) => {
        body.current[key] = value;
    }

    const invalidate = (key: string) => {
        delete body.current[key]
    }

    return {
        current: body.current,
        get: get,
        register: register,
        invalidate: invalidate
    }
}
