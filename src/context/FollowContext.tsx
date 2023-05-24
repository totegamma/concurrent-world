import { createContext, useContext } from 'react'
import { usePersistent } from '../hooks/usePersistent'

interface FollowState {
    followingUsers: string[]
    followUser: (_: string) => void
    unfollowUser: (_: string) => void

    followingStreams: string[]
    setFollowingStreams: (_: string[]) => void
    followStream: (_: string) => void
    unfollowStream: (_: string) => void

    bookmarkingStreams: string[]
    bookmarkStream: (_: string) => void
    unbookmarkStream: (_: string) => void
}

const FollowContext = createContext<FollowState | undefined>(undefined)

interface FollowProviderProps {
    children: JSX.Element
}

export const FollowProvider = (props: FollowProviderProps): JSX.Element => {
    const [followingUsers, setFollowingUsers] = usePersistent<string[]>(
        'followingUsers',
        []
    )
    const [followingStreams, setFollowingStreams] = usePersistent<string[]>(
        'followingStreams',
        []
    )
    const [bookmarkingStreams, setBookmarkingStreams] = usePersistent<string[]>(
        'bookmarkingStreams',
        []
    )

    const followUser = (ccaddr: string): void => {
        if (followingUsers.includes(ccaddr)) return
        setFollowingUsers([...followingUsers, ccaddr])
    }

    const unfollowUser = (ccaddr: string): void => {
        setFollowingUsers(followingUsers.filter((e: string) => e !== ccaddr))
    }

    const followStream = (streamID: string): void => {
        if (followingStreams.includes(streamID)) return
        setFollowingStreams([...followingStreams, streamID])
    }

    const unfollowStream = (streamID: string): void => {
        setFollowingStreams(
            followingStreams.filter((e: string) => e !== streamID)
        )
    }

    const bookmarkStream = (streamID: string): void => {
        if (bookmarkingStreams.includes(streamID)) return
        setBookmarkingStreams([...bookmarkingStreams, streamID])
    }

    const unbookmarkStream = (streamID: string): void => {
        setBookmarkingStreams(
            bookmarkingStreams.filter((e: string) => e !== streamID)
        )
    }

    return (
        <FollowContext.Provider
            value={{
                followingUsers,
                setFollowingStreams,
                followUser,
                unfollowUser,
                followingStreams,
                followStream,
                unfollowStream,
                bookmarkingStreams,
                bookmarkStream,
                unbookmarkStream
            }}
        >
            {props.children}
        </FollowContext.Provider>
    )
}

export function useFollow(): FollowState {
    return useContext(FollowContext) as FollowState
}
