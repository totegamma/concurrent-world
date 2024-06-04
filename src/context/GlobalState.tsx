import { type CoreEntity } from '@concurrent-world/client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useClient } from './ClientContext'

export interface GlobalState {
    isCanonicalUser: boolean
    isRegistered: boolean
    isDomainOffline: boolean
    isMasterSession: boolean
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined)

interface GlobalStateProps {
    children: JSX.Element | JSX.Element[]
}

export const GlobalStateProvider = ({ children }: GlobalStateProps): JSX.Element => {
    const { client } = useClient()

    const [isDomainOffline, setDomainIsOffline] = useState<boolean>(false)
    const [entity, setEntity] = useState<CoreEntity | null>(null)
    const isCanonicalUser = entity ? entity.domain === client?.host : true
    const [isRegistered, setIsRegistered] = useState<boolean>(true)
    const isMasterSession = JSON.parse(localStorage.getItem('Identity') || 'null') !== null

    useEffect(() => {
        client.api
            .fetchWithCredential(client.host, '/api/v1/entity', {
                method: 'GET'
            })
            .then((res) => {
                if (res.status === 403) {
                    setIsRegistered(false)
                }
                res.json().then((json) => {
                    console.log('hogehoge', json.content)
                    setEntity(json.content)
                })
            })
            .catch((e) => {
                console.error(e)
                setDomainIsOffline(true)
            })
    }, [client])

    return (
        <GlobalStateContext.Provider
            value={{
                isCanonicalUser,
                isRegistered,
                isDomainOffline,
                isMasterSession
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    )
}

export function useGlobalState(): GlobalState {
    const context = useContext(GlobalStateContext)
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider')
    }
    return context
}
