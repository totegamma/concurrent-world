import { createContext, useContext } from 'react'
import { type Client } from '@concurrent-world/client'

const ApiContext = createContext<Client | undefined>(undefined)

export interface ApiProviderProps {
    children: JSX.Element
    api: Client
}

export default function ApiProvider(props: ApiProviderProps): JSX.Element {
    return <ApiContext.Provider value={props.api}>{props.children}</ApiContext.Provider>
}

export function useApi(): Client {
    return useContext(ApiContext) as Client
}
