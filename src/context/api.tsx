import { createContext, useContext } from 'react'
import type ConcurrentApiClient from '../apiservice'

const ApiContext = createContext<ConcurrentApiClient | undefined>(undefined)

export interface ApiProviderProps {
    children: JSX.Element
    api: ConcurrentApiClient
}

export default function ApiProvider(props: ApiProviderProps): JSX.Element {
    return (
        <ApiContext.Provider value={props.api}>
            {props.children}
        </ApiContext.Provider>
    )
}

export function useApi(): ConcurrentApiClient {
    return useContext(ApiContext) as ConcurrentApiClient
}
