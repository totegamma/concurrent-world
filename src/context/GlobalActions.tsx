import { Box, Paper, Modal, Typography, Divider } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { Schemas, type RawDomainProfile, type CoreCharacter, type Message, type Stream } from '@concurrent-world/client'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { usePreference } from './PreferenceContext'
import { ApplicationContext } from '../App'
import { ProfileEditor } from '../components/ProfileEditor'
import { MessageContainer } from '../components/Timeline/MessageContainer'

export interface GlobalActionsState {
    openDraft: () => void
    openReply: (target: Message) => void
    openReroute: (target: Message) => void
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
    const [mode, setMode] = useState<'compose' | 'reply' | 'reroute' | 'none'>('none')
    const [targetMessage, setTargetMessage] = useState<Message | null>(null)

    const [queriedStreams, setQueriedStreams] = useState<Stream[]>([])

    const setupAccountRequired =
        appData.user !== null && (appData.user.profile === undefined || appData.user.userstreams === undefined)

    const openDraft = useCallback(() => {
        setMode('compose')
    }, [])

    const openReply = useCallback((target: Message) => {
        setTargetMessage(target)
        setMode('reply')
    }, [])

    const openReroute = useCallback((target: Message) => {
        setTargetMessage(target)
        setMode('reroute')
    }, [])

    useEffect(() => {
        const ids = reactlocation.hash
            .replace('#', '')
            .split(',')
            .filter((e) => e !== '')
        Promise.all(ids.map((id) => client.getStream(id))).then((streams) => {
            setQueriedStreams(streams.filter((e) => e !== null) as Stream[])
        })
    }, [reactlocation.hash])

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
                    openDraft,
                    openReply,
                    openReroute
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
                <>
                    {mode === 'compose' && (
                        <Paper sx={style}>
                            <Box sx={{ display: 'flex' }}>
                                <Draft
                                    autoFocus
                                    streamPickerInitial={queriedStreams}
                                    streamPickerOptions={queriedStreams}
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
                    )}
                    {targetMessage && (mode === 'reply' || mode === 'reroute') && (
                        <Paper sx={style}>
                            <MessageContainer messageID={targetMessage.id} messageOwner={targetMessage.author.ccaddr} />
                            <Divider />
                            <Box sx={{ display: 'flex' }}>
                                <Draft
                                    autoFocus
                                    allowEmpty={mode === 'reroute'}
                                    submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                    streamPickerInitial={targetMessage.streams}
                                    streamPickerOptions={targetMessage.streams}
                                    onSubmit={async (text, streams): Promise<Error | null> => {
                                        if (mode === 'reroute')
                                            await client.reroute(
                                                targetMessage.id,
                                                targetMessage.author.ccaddr,
                                                streams,
                                                text
                                            )
                                        else
                                            await client.reply(
                                                targetMessage.id,
                                                targetMessage.author.ccaddr,
                                                streams,
                                                text
                                            )
                                        setMode('none')
                                        return null
                                    }}
                                />
                            </Box>
                        </Paper>
                    )}
                </>
            </Modal>
            <Modal open={setupAccountRequired} onClose={() => {}}>
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
                            id={appData.user?.profile?.id}
                            initial={appData.user?.profile}
                            onSubmit={(_) => {
                                client.setupUserstreams().then(() => {
                                    client.api.getHostProfile(client.api.host).then((host) => {
                                        client.api
                                            .readCharacter(host.ccaddr, Schemas.domainProfile)
                                            .then((profile: CoreCharacter<RawDomainProfile> | undefined) => {
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
