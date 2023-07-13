import { Box, Paper, Modal, Typography } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { Schemas, type DomainProfile, type CoreCharacter } from '@concurrent-world/client'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { usePreference } from './PreferenceContext'
import { ApplicationContext } from '../App'
import { ProfileEditor } from '../components/ProfileEditor'

export interface GlobalActionsState {
    openDraft: () => void
}

const GlobalActionsContext = createContext<GlobalActionsState | undefined>(undefined)

interface GlobalActionsProps {
    children: JSX.Element | JSX.Element[]
}

const style = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '700px',
    maxWidth: '90vw',
    p: 1
}

export const GlobalActionsProvider = (props: GlobalActionsProps): JSX.Element => {
    const client = useApi()
    const pref = usePreference()
    const reactlocation = useLocation()
    const appData = useContext(ApplicationContext)
    const [mode, setMode] = useState<'compose' | 'none'>('none')

    const accountIsOK = appData.user?.profile !== null && appData.user?.userstreams !== null

    const openDraft = useCallback(() => {
        setMode('compose')
    }, [])

    const queriedStreams = useMemo(
        () =>
            reactlocation.hash
                .replace('#', '')
                .split(',')
                .filter((e) => e !== ''),
        [reactlocation.hash]
    )

    const streamPickerInitial = useMemo(
        () => [
            ...new Set([
                ...(reactlocation.hash && reactlocation.hash !== '' ? pref.defaultPostNonHome : pref.defaultPostHome),
                ...queriedStreams
            ])
        ],
        [reactlocation.hash, pref.defaultPostHome, pref.defaultPostNonHome, queriedStreams]
    )

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
            return
        }
        switch (event.key) {
            case 'n':
                setTimeout(() => {
                    // XXX: this is a hack to prevent the keypress from being captured by the draft
                    openDraft()
                }, 0)
                break
        }
    }, [])

    useEffect(() => {
        // attach the event listener
        document.addEventListener('keydown', handleKeyPress)

        // remove the event listener
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    }, [handleKeyPress])

    return (
        <GlobalActionsContext.Provider
            value={useMemo(() => {
                return {
                    openDraft
                }
            }, [])}
        >
            {props.children}
            <Modal
                open={mode !== 'none'}
                onClose={() => {
                    setMode('none')
                }}
            >
                <Paper sx={style}>
                    <Box sx={{ display: 'flex' }}>
                        <Draft
                            autoFocus
                            streamPickerInitial={streamPickerInitial}
                            onSubmit={async (text: string, destinations: string[]) => {
                                client
                                    .createCurrent(text, destinations)
                                    .then(() => {
                                        return null
                                    })
                                    .catch((e) => {
                                        return e
                                    })
                                    .finally(() => {
                                        setMode('none')
                                    })
                                return await Promise.resolve(null)
                            }}
                        />
                    </Box>
                </Paper>
            </Modal>
            <Modal open={!accountIsOK} onClose={() => {}}>
                <Paper sx={style}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h2" component="div">
                            アカウント設定を完了させましょう！
                        </Typography>
                        <ProfileEditor
                            onSubmit={(_) => {
                                client.setupUserstreams().then(() => {
                                    client.api.getHostProfile(client.api.host).then((host) => {
                                        client.api
                                            .readCharacter(host.ccaddr, Schemas.domainProfile)
                                            .then((profile: CoreCharacter<DomainProfile> | undefined) => {
                                                console.log(profile)
                                                try {
                                                    if (profile) {
                                                        if (profile.payload.body.defaultBookmarkStreams)
                                                            localStorage.setItem(
                                                                'bookmarkingStreams',
                                                                JSON.stringify(
                                                                    profile.payload.body.defaultBookmarkStreams
                                                                )
                                                            )
                                                        if (profile.payload.body.defaultFollowingStreams)
                                                            localStorage.setItem(
                                                                'followingStreams',
                                                                JSON.stringify(
                                                                    profile.payload.body.defaultFollowingStreams
                                                                )
                                                            )
                                                        if (profile.payload.body.defaultPostStreams)
                                                            localStorage.setItem(
                                                                'defaultPostHome',
                                                                JSON.stringify(profile.payload.body.defaultPostStreams)
                                                            )
                                                    }
                                                } catch (e) {
                                                    console.error(e)
                                                }
                                                window.location.reload()
                                            })
                                    })
                                })
                            }}
                        />
                        以前は使えていたのにこの画面が出る場合は上のUPDATEを押さずに、
                        再度通信環境の良い場所でリロードしてみてください。
                    </Box>
                </Paper>
            </Modal>
        </GlobalActionsContext.Provider>
    )
}

export function useGlobalActions(): GlobalActionsState {
    return useContext(GlobalActionsContext) as GlobalActionsState
}
