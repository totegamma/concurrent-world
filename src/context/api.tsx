import { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '@concurrent-world/client'
import { usePersistent } from '../hooks/usePersistent'

// @ts-expect-error vite dynamic import
import { branch, sha } from '~build/info'
import { FullScreenLoading } from '../components/ui/FullScreenLoading'

const branchName = branch || window.location.host.split('.')[0]
const versionString = `${location.hostname}-${branchName as string}-${sha.slice(0, 7) as string}`

const ApiContext = createContext<Client | undefined>(undefined)

export interface ApiProviderProps {
    children: JSX.Element
    client?: Client
}

export default function ApiProvider(props: ApiProviderProps): JSX.Element {
    const [domain] = usePersistent<string>('Domain', '')
    const [prvkey] = usePersistent<string>('PrivateKey', '')
    const [subkey] = usePersistent<string>('SubKey', '')
    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        if (props.client) return

        if (prvkey !== '') {
            Client.create(prvkey, domain, versionString)
                .then((client) => {
                    initializeClient(client)
                })
                .catch((e) => {
                    console.error(e)
                })
        } else if (subkey !== '') {
            Client.createFromSubkey(subkey, versionString)
                .then((client) => {
                    initializeClient(client)
                })
                .catch((e) => {
                    console.error(e)
                })
        }
    }, [domain, prvkey])

    if (!(client ?? props.client)) {
        return <FullScreenLoading message="Initializing client..." />
    }

    return <ApiContext.Provider value={props.client ?? client}>{props.children}</ApiContext.Provider>
}

export function useApi(): Client {
    return useContext(ApiContext) as Client
}
