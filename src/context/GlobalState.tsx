import {
    type Timeline,
    type CoreEntity,
    type CommunityTimelineSchema,
    type CoreSubscription,
    Schemas
} from '@concurrent-world/client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useClient } from './ClientContext'
import { usePreference } from './PreferenceContext'

export interface GlobalState {
    isCanonicalUser: boolean
    isRegistered: boolean
    isDomainOffline: boolean
    isMasterSession: boolean

    allKnownTimelines: Array<Timeline<CommunityTimelineSchema>>
    allKnownSubscriptions: Array<CoreSubscription<any>>
    listedSubscriptions: Record<string, CoreSubscription<any>>
    reloadList: () => void
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined)

interface GlobalStateProps {
    children: JSX.Element | JSX.Element[]
}

export const GlobalStateProvider = ({ children }: GlobalStateProps): JSX.Element => {
    const { client } = useClient()
    const [lists] = usePreference('lists')

    const [isDomainOffline, setDomainIsOffline] = useState<boolean>(false)
    const [entity, setEntity] = useState<CoreEntity | null>(null)
    const isCanonicalUser = entity ? entity.domain === client?.host : true
    const [isRegistered, setIsRegistered] = useState<boolean>(true)
    const isMasterSession = JSON.parse(localStorage.getItem('Identity') || 'null') !== null

    const [allKnownTimelines, setAllKnownTimelines] = useState<Array<Timeline<CommunityTimelineSchema>>>([])
    const [allKnownSubscriptions, setAllKnownSubscriptions] = useState<Array<CoreSubscription<any>>>([])
    const [listedSubscriptions, setListedSubscriptions] = useState<Record<string, CoreSubscription<any>>>({})

    useEffect(() => {
        client.api.getOwnSubscriptions<any>().then((subs) => {
            setAllKnownSubscriptions(subs)
        })
    }, [])

    useEffect(() => {
        let unmounted = false
        setAllKnownTimelines([])
        Promise.all(
            Object.keys(lists).map((id) =>
                client.api
                    .getSubscription(id)
                    .then((sub) => {
                        return [id, sub]
                    })
                    .catch((e) => {
                        console.log(e)
                        return [id, null]
                    })
            )
        ).then((subs) => {
            if (unmounted) return
            const validsubsarr = subs.filter((e) => e[1]) as Array<[string, CoreSubscription<any>]>
            const listedSubs = Object.fromEntries(validsubsarr)
            setListedSubscriptions(listedSubs)

            const validsubs = validsubsarr.map((e) => e[1])

            const allTimelines = validsubs.flatMap((sub) => sub.items.map((e) => e.id))
            const uniq = [...new Set(allTimelines)]
            uniq.forEach((id) => {
                client.getTimeline<CommunityTimelineSchema>(id).then((stream) => {
                    if (stream && !unmounted) {
                        if (stream.schema !== Schemas.communityTimeline) return
                        setAllKnownTimelines((prev) => [...prev, stream])
                    }
                })
            })
        })

        return () => {
            unmounted = true
        }
    }, [lists])

    const reloadList = useCallback(() => {
        setAllKnownTimelines([])
        Promise.all(
            Object.keys(lists).map((id) =>
                client.api
                    .getSubscription(id)
                    .then((sub) => {
                        return [id, sub]
                    })
                    .catch((e) => {
                        console.log(e)
                        return [id, null]
                    })
            )
        ).then((subs) => {
            const validsubsarr = subs.filter((e) => e[1]) as Array<[string, CoreSubscription<any>]>
            const listedSubs = Object.fromEntries(validsubsarr)
            setListedSubscriptions(listedSubs)

            const validsubs = validsubsarr.map((e) => e[1])

            const allTimelins = validsubs.flatMap((sub) => sub.items.map((e) => e.id))
            const uniq = [...new Set(allTimelins)]
            uniq.forEach((id) => {
                client.getTimeline<CommunityTimelineSchema>(id).then((stream) => {
                    if (stream) {
                        setAllKnownTimelines((prev) => [...prev, stream])
                    }
                })
            })
        })
        client.api.getOwnSubscriptions<any>().then((subs) => {
            setAllKnownSubscriptions(subs)
        })
    }, [client, lists])

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
                isMasterSession,
                allKnownTimelines,
                allKnownSubscriptions,
                listedSubscriptions,
                reloadList
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    )
}

export function useGlobalState(): GlobalState {
    const context = useContext(GlobalStateContext)
    if (context === undefined) {
        return {
            isCanonicalUser: false,
            isRegistered: false,
            isDomainOffline: false,
            isMasterSession: false,
            allKnownTimelines: [],
            allKnownSubscriptions: [],
            listedSubscriptions: {},
            reloadList: () => {}
        }
    }
    return context
}
