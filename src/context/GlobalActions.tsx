import { Box, Paper, Modal, Typography, Divider, Button, Drawer, useTheme } from '@mui/material'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useApi } from './api'
import { Schemas, type RawDomainProfile, type CoreCharacter, type Message, type Stream } from '@concurrent-world/client'
import { Draft } from '../components/Draft'
import { useLocation } from 'react-router-dom'
import { usePreference } from './PreferenceContext'
import { ProfileEditor } from '../components/ProfileEditor'
import { MessageContainer } from '../components/Message/MessageContainer'
import { Menu } from '../components/Menu/Menu'

export interface GlobalActionsState {
    openDraft: () => void
    openReply: (target: Message) => void
    openReroute: (target: Message) => void
    openMobileMenu: (open?: boolean) => void
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
    const path = useLocation()
    const theme = useTheme()
    const [mode, setMode] = useState<'compose' | 'reply' | 'reroute' | 'none'>('none')
    const [targetMessage, setTargetMessage] = useState<Message | null>(null)

    const [queriedStreams, setQueriedStreams] = useState<Stream[]>([])
    const [allKnownStreams, setAllKnownStreams] = useState<Stream[]>([])
    const [domainIsOffline, setDomainIsOffline] = useState<boolean>(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

    const setupAccountRequired =
        client?.user !== null && (client?.user.profile === undefined || client?.user.userstreams === undefined)

    useEffect(() => {
        const allStreams = Object.values(pref.lists)
            .map((list) => list.streams)
            .flat()
        const uniq = [...new Set(allStreams)]
        Promise.all(uniq.map((id) => client.getStream(id))).then((streams) => {
            setAllKnownStreams(streams.filter((e) => e !== null) as Stream[])
        })
    }, [pref.lists])

    useEffect(() => {
        client.api.readDomain(client.api.host).then((domain) => {
            if (domain === null) {
                setDomainIsOffline(true)
            }
        })
    }, [client.user])

    const openDraft = useCallback(() => {
        let streamIDs: string[] = []
        switch (path.pathname) {
            case '/stream': {
                streamIDs = path.hash.replace('#', '').split(',')
                break
            }
            default: {
                const rawid = path.hash.replace('#', '')
                const list = pref.lists[rawid] ?? Object.values(pref.lists)[0]
                if (!list) break
                streamIDs = list.defaultPostStreams
                break
            }
        }

        Promise.all(streamIDs.map((id) => client.getStream(id))).then((streams) => {
            setQueriedStreams(streams.filter((e) => e !== null) as Stream[])
        })

        setMode('compose')
    }, [path.pathname, path.hash, pref.lists])

    const openReply = useCallback((target: Message) => {
        setTargetMessage(target)
        setMode('reply')
    }, [])

    const openReroute = useCallback(
        (target: Message) => {
            setTargetMessage(target)
            setMode('reroute')
        },
        [setTargetMessage, setMode]
    )

    const openMobileMenu = useCallback((open?: boolean) => {
        setMobileMenuOpen(open ?? true)
    }, [])

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
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
        },
        [openDraft]
    )

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
                    openReroute,
                    openMobileMenu
                }
            }, [openDraft, openReply, openReroute, openMobileMenu])}
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
                                    streamPickerOptions={allKnownStreams}
                                    onSubmit={async (text: string, destinations: string[], emojis) => {
                                        client
                                            .createCurrent(text, destinations, emojis)
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
                            <MessageContainer messageID={targetMessage.id} messageOwner={targetMessage.author.ccid} />
                            <Divider />
                            <Box sx={{ display: 'flex' }}>
                                <Draft
                                    autoFocus
                                    allowEmpty={mode === 'reroute'}
                                    submitButtonLabel={mode === 'reply' ? 'Reply' : 'Reroute'}
                                    streamPickerInitial={targetMessage.streams}
                                    streamPickerOptions={mode === 'reroute' ? allKnownStreams : targetMessage.streams}
                                    onSubmit={async (text, streams, emojis): Promise<Error | null> => {
                                        if (mode === 'reroute')
                                            await client.reroute(
                                                targetMessage.id,
                                                targetMessage.author.ccid,
                                                streams,
                                                text,
                                                emojis
                                            )
                                        else
                                            await client.reply(
                                                targetMessage.id,
                                                targetMessage.author.ccid,
                                                streams,
                                                text,
                                                emojis
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
            <Modal open={domainIsOffline} onClose={() => {}}>
                <Paper sx={style}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography>
                            あなたのドメイン{client.api.host}は現在オフラインです。復旧までしばらくお待ちください。
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => {
                                window.location.reload()
                            }}
                        >
                            Reload
                        </Button>
                    </Box>
                </Paper>
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
                            id={client?.user?.profile?.id}
                            initial={client?.user?.profile}
                            onSubmit={(_) => {
                                client.setupUserstreams().then(() => {
                                    client.api.readDomain(client.api.host).then((domain) => {
                                        if (!domain) return // TODO: add notice
                                        client.api
                                            .readCharacter(domain.ccid, Schemas.domainProfile)
                                            .then((profile: CoreCharacter<RawDomainProfile> | null | undefined) => {
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
            <Drawer
                anchor={'left'}
                open={mobileMenuOpen}
                onClose={() => {
                    setMobileMenuOpen(false)
                }}
                PaperProps={{
                    sx: {
                        width: '200px',
                        pt: 1,
                        borderRadius: `0 ${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0`,
                        overflow: 'hidden',
                        backgroundColor: 'background.default'
                    }
                }}
            >
                <Menu
                    onClick={() => {
                        setMobileMenuOpen(false)
                    }}
                />
            </Drawer>
        </GlobalActionsContext.Provider>
    )
}

export function useGlobalActions(): GlobalActionsState {
    return useContext(GlobalActionsContext) as GlobalActionsState
}
