import React, { useState } from 'react';
function parseJsonSafely(input: string) {
    var parsed: any = null;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        // Do nothing ;)
    }
    return parsed;
}


export function usePersistent<T>(key: string, init: T): [value: T, update: (newValue: T) => void] {

    const [value, setValue] = useState<T>(parseJsonSafely(localStorage.getItem(key) ?? 'null') ?? init);

    const update = (newValue: T) => {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
    }

    return [value, update];
}
