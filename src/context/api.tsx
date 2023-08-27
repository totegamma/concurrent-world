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
}

export default function ApiProvider(props: ApiProviderProps): JSX.Element {
    const [domain] = usePersistent<string>('Domain', '')
    const [prvkey] = usePersistent<string>('PrivateKey', '')
    const [client, initializeClient] = useState<Client>()
    useEffect(() => {
        Client.create(prvkey, domain, versionString)
            .then((client) => {
                initializeClient(client)
            })
            .catch((e) => {
                console.error(e)
            })
    }, [domain, prvkey])

    if (!client) {
        return <FullScreenLoading message="Initializing client..." />
    }

    return <ApiContext.Provider value={client}>{props.children}</ApiContext.Provider>
}

export function useApi(): Client {
    return useContext(ApiContext) as Client
}
